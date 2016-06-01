#pragma once
#include "point.hpp"

class Pawn {
    public:
        Point * position;
        int color;
		bool dead;
        
		Pawn() {}
		Pawn(Point * position, int color) : position(position), color(color) { dead = false; }
};