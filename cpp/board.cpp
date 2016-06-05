#include "board.hpp"
#include <iostream>

void Board::init_board() {
    turn = 0;
    turn_number = 0;
    
    _pawns[0] = std::vector<Pawn *>();
    _pawns[1] = std::vector<Pawn *>();
	_moves = std::vector<Move *>();
    
    for (int i = 0; i < board_size; i++) {
        std::vector<Pawn *> row;
        
        for (int j = 0; j < board_size; j++)
            row.push_back(NULL);
            
        board.push_back(row);
    }
    
    for (int y = 0; y < 2; y++)
        for (int x = 0; x < board_size; x++) {
            Pawn * pawn = new Pawn(new Point(x, y), 1);
            board[y][x] = pawn;
            _pawns[1].push_back(pawn);
        }
        
    for (int y = board_size - 2; y < board_size; y++)
        for (int x = 0; x < board_size; x++) {
            Pawn * pawn = new Pawn(new Point(x, y), 0);
            board[y][x] = pawn;
            _pawns[0].push_back(pawn);
        }

	recalculate_moves();
}

int Board::check_end() {
	bool no_pawns = true;
	for (auto pawn : _pawns[1])
		if (!pawn->dead) {
			no_pawns = false;
			break;
		}
	if (no_pawns) return 0;

	no_pawns = true;
	for (auto pawn : _pawns[0])
		if (!pawn->dead) {
			no_pawns = false;
			break;
		}
	if (no_pawns) return 1;

    
    for (int x = 0; x < board_size; x++) {
        Pawn * p_0 = board[0][x];
        Pawn * p_1 = board[board_size - 1][x];
        
        if (p_0 != NULL && p_0->color == 0) return 0;
        if (p_1 != NULL && p_1->color == 1) return 1;
    }
    
    return -1;
}

void Board::next_turn() {
    turn ^= 1;
    turn_number++;
}

void Board::previous_turn() {
    turn ^= 1;
    turn_number--;
}

std::vector<Pawn *> * Board::get_pawns(int color) {
    return &_pawns[color];
}

std::vector<Move *> * Board::get_possible_moves_of_pawns() {
	return &_moves;  
}

void Board::recalculate_moves() {
	for (auto move : _moves)
		delete move;
	_moves.clear();

	if (check_end() != -1) return;

	for (auto it : _pawns[turn]) {
		Pawn * pawn = it;
		if (pawn->dead) continue;

		int deltay = pawn->color ? 1 : -1;

		for (int deltax = -1; deltax <= 1; deltax++) {
			int x = pawn->position->x + deltax;
			int y = pawn->position->y + deltay;

			if (x >= 0 && x < board_size &&
				y >= 0 && y < board_size &&
				(!board[y][x] || (deltax != 0 && board[y][x]->color != pawn->color)))
				_moves.push_back(new Move(pawn, new Point(x, y)));
		}
	}
}

void Board::move_pawn(Pawn * pawn, Point * point) {
    Pawn * previous_pawn = get_pawn(point);
    undo_stack.push(new UndoHistory(
        pawn,
        new Point(pawn->position->x, pawn->position->y),
        previous_pawn
    ));
    
    if (previous_pawn)
		previous_pawn->dead = true;
    
    board[pawn->position->y][pawn->position->x] = NULL;
    pawn->position->x = point->x;
	pawn->position->y = point->y;
    board[point->y][point->x] = pawn;
    
    next_turn();
	recalculate_moves();
}

void Board::undo_move() {
    UndoHistory * history = undo_stack.top();
    undo_stack.pop();

	if (history->previous_pawn)
		history->previous_pawn->dead = false;

	board[history->moved_pawn->position->y][history->moved_pawn->position->x] = history->previous_pawn;
	history->moved_pawn->position->x = history->previous_position->x;
	history->moved_pawn->position->y = history->previous_position->y;
	board[history->previous_position->y][history->previous_position->x] = history->moved_pawn;
    
	previous_turn();
	recalculate_moves();
	delete history;
}

Pawn * Board::get_pawn(Point * point) {
    return board[point->y][point->x];
}