#include "pawn.hpp"
#include <stack>
#include <vector>
#include <algorithm>

struct Move {
    Pawn * pawn;
    Point * point;
    
	Move(Pawn * pawn, Point * point) : pawn(pawn), point(point) {}
	~Move() { delete point; }
};

struct UndoHistory {
    Pawn * moved_pawn;
    Point * previous_position;
    Pawn * previous_pawn;
    
    UndoHistory(Pawn * moved_pawn, Point * previous_position, Pawn * previous_pawn) :
		moved_pawn(moved_pawn), previous_position(previous_position), previous_pawn(previous_pawn) {}
	~UndoHistory() { delete previous_position; }
};

class Board {
    private:
        std::vector<Pawn *> _pawns[2];
		std::vector<Move *> _moves;
        
    public:
        int board_size;
        int turn;
        int turn_number;
        std::vector<std::vector<Pawn *> > board;
        std::stack<UndoHistory *> undo_stack;
        
        Board(int board_size) : board_size(board_size) {};
        void init_board();
        int check_end();
        void next_turn();
        void previous_turn();
        std::vector<Pawn *> * get_pawns(int color);
        std::vector<Move *> * get_possible_moves_of_pawns();
        void move_pawn(Pawn * pawn, Point * point);
        void undo_move();
        Pawn * get_pawn(Point * point);
		void recalculate_moves();
};