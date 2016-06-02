#define _USE_MATH_DEFINES

#include "board.hpp"
#include "point.hpp"
#include "pawn.hpp"
#include <cmath>
#include <ctime>
#include <iostream>
#include <chrono>
#include <emscripten.h>

struct TreeNode {
	int q, n;
	TreeNode * parent;
	std::vector<TreeNode *> children;

	TreeNode(TreeNode * parent, Board * board) : q(0), n(0), parent(parent) {
		unsigned length = board->get_possible_moves_of_pawns()->size();
		for (int i = 0; i < length; i++)
			children.push_back(NULL);
	};
	
	~TreeNode() {
		for (auto child : children)
			if (child) delete child;
	}
};


float aggressiveness = 1.0;
int thinking_time = 10000;
double cp = M_SQRT1_2;
TreeNode * root = NULL;
int color = -1;
Board board = Board(8);
bool working = true;
long long request_time = 0;

void init_onmessage();
long long get_milliseconds();
void move_best();
TreeNode * tree_policy(TreeNode * v);
TreeNode * expand(TreeNode * v);
int best_child(TreeNode * v, double c);
int default_policy(int turn);
int do_some_random_moves(int turn);
void back_up(TreeNode * v, int reward);

extern "C" {
	void UCT_search();
	void move_root(int x1, int y1, int x2, int y2);
	void set_color(int c) { color = c; };
	void set_request_time() { request_time = get_milliseconds(); };
	void stop_working() { working = false; };
	void move_pawn_called_by_js(int x1, int y1, int x2, int y2) {
		board.move_pawn(board.get_pawn(new Point(x1, y1)), new Point(x2, y2));
	};
}

long long get_milliseconds() {
	return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now().time_since_epoch()).count();
}

int main() {
	srand(time(NULL));
	board.init_board();
	root = new TreeNode(NULL, &board);
	init_onmessage();
	
	return 0;
}

void init_onmessage() {
	EM_ASM(
		onmessage = function(ev) {
			switch (ev.data.type) {
				case 'color':
					console.log('doszedl color');
					Module.ccall('set_color', null, ['number'], [ev.data.color]);
					Module.ccall('UCT_search', null);
					break;

				case 'stop':
					Module.ccall('stop_working', null);
					break;

				case 'move':
					Module.ccall('set_request_time', null);
					break;

				case 'moved':
					Module.ccall('move_root', null, ['number', 'number', 'number', 'number'],
						[ev.data.positionBefore.x, ev.data.positionBefore.y, ev.data.positionAfter.x, ev.data.positionAfter.y]
					);
					Module.ccall('move_pawn_called_by_js', null, ['number', 'number', 'number', 'number'],
						[ev.data.positionBefore.x, ev.data.positionBefore.y, ev.data.positionAfter.x, ev.data.positionAfter.y]
					);
					break;

				default:
					break;
			}
		};
	);
}

void UCT_search_packed(void* args) {
	UCT_search();
}

void UCT_search() {
	int start = get_milliseconds();
	int now = start;
	
	while (working) {
		if (now - start > 500)
			return emscripten_async_call(UCT_search_packed, NULL, 0);

		if (request_time && now - request_time > thinking_time)
			move_best();
			
		TreeNode * v = tree_policy(root);
		int reward = default_policy(board.turn);
		back_up(v, reward);
		now = get_milliseconds();
	}
	
	EM_ASM(
		close();
	);
}

TreeNode * tree_policy(TreeNode * v) {
	while (board.get_possible_moves_of_pawns()->size()) {
		if (v->n < board.get_possible_moves_of_pawns()->size())
			return expand(v);

		int best = best_child(v, cp);
		auto move = board.get_possible_moves_of_pawns()->at(best);
		board.move_pawn(move->pawn, move->point);

		v = v->children[best];
	}

	return v;
}

TreeNode * expand(TreeNode * v) {
	auto moves = board.get_possible_moves_of_pawns();
	int length = moves->size();
	std::vector<int> candidates;

	for (int i = 0; i < length; i++)
		if (!v->children[i]) candidates.push_back(i);
		
	int move_number = candidates[rand() % candidates.size()];
	Move * move = moves->at(move_number);
	board.move_pawn(move->pawn, move->point);

	TreeNode * new_node = new TreeNode(v, &board);
	v->children[move_number] = new_node;

	return new_node;
}

int best_child(TreeNode * v, double c) {
	std::vector<int> moves;
	double max = -999999;

	for (int i = 0; i < v->children.size(); i++) {
		TreeNode * u = v->children[i];
		if (!u) continue;

		double value = (double)u->q / (double)u->n + c * sqrt(2 * log(v->n) / u->n);

		if (value > max) {
			moves.clear();
			max = value;
		}

		if (value >= max)
			moves.push_back(i);
	}

	return moves[rand() % moves.size()];
}

int default_policy(int turn) {
	return do_some_random_moves(turn);
}

int do_some_random_moves(int turn) {
	int winner = board.check_end();
	if (winner != -1) return winner ^ turn;

	std::vector<Move *> * moves = board.get_possible_moves_of_pawns();
	std::vector<Move *> * attack_moves = new std::vector<Move *>();

	if (rand() % 100 < aggressiveness * 100) {
		for (auto move : *moves)
			if (board.get_pawn(move->point) && !board.get_pawn(move->point)->dead)
				attack_moves->push_back(move);

		if (attack_moves->size())
			moves = attack_moves;
	}

	Move * move = moves->at(rand() % moves->size());
	board.move_pawn(move->pawn, move->point);

	int result = do_some_random_moves(turn);

	board.undo_move();
	
	delete attack_moves;
	return result;
}

void back_up(TreeNode * v, int reward) {
	while (v != NULL) {
		v->q += reward;
		v->n++;
		reward ^= 1;

		if (v->parent != NULL)
			board.undo_move();

		v = v->parent;
	}
}

void move_root(int x1, int y1, int x2, int y2) {
	if (root) {
		int move_number = 0;

		for (auto move : *board.get_possible_moves_of_pawns()) {
			if (move->pawn->position->x == x1 &&
				move->point->x == x2 &&
				move->pawn->position->y == y1 &&
				move->point->y == y2)
				break;
			
			move_number++;
		}
		
		root = root->children[move_number];
		if (root) {
			root->parent->children[move_number] = NULL;
			delete root->parent;
			root->parent = NULL;
		}
	}

	if (!root)
		root = new TreeNode(NULL, &board);
}

void move_best() {
	std::cout << root->n << "\n";

	int best = best_child(root, 0);
	Move * move = board.get_possible_moves_of_pawns()->at(best);

	request_time = 0;
	EM_ASM_({
		postMessage({
			type: 'move',
			positionBefore: { x: $0, y: $1 },
			positionAfter: { x: $2, y: $3 }
		});
	}, move->pawn->position->x, move->pawn->position->y, move->point->x, move->point->y);

	board.move_pawn(move->pawn, move->point);
	
	root = root->children[best];
	root->parent->children[best] = NULL;
	delete root->parent;
	root->parent = NULL;

	std::cout << (double)root->q * 100.0 / (double)root->n << "% " << root->q << " " << root->n << "\n";
}
