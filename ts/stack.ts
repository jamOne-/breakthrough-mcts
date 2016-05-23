export class Stack<T> {
    private _root : StackNode<T>;
    
    public constructor() {
        this._root = null;
    }
    
    public isEmpty() {
        return this._root == null;
    }
    
    public peek() {
        return this._root.e;
    }
    
    public pop() {
        let e = this._root.e;
        this._root = this._root.next;
        
        return e;
    }
    
    public push(e : T) {
        this._root = {
            next: this._root,
            e: e
        };
    }
}

interface StackNode<T> {
    next : StackNode<T>,
    e : T  
}