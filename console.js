var sprintf=require("sprintf-js").sprintf;
var stdin = process.stdin;

stdin.setRawMode(true);
stdin.resume();

function Game(width, height) {
    function makeSequences(w, h, lr, INIT, ADD, CALC_CURRENT) {
        var c = 0, r = 0, s = null, a = INIT();
        if (!lr)  {
            var x = w;
            w = h;
            h = x;
        }
        for (r; r < h; r++) {
            s = INIT();
            ADD(a, s);
            for (c = 0; c < w; c++) {
                ADD(s, CALC_CURRENT(w, h, r, c));
            }
        }
        return a;
    };
    var sequences = {
        'left': makeSequences(width, height, true,
                              function() { return []; },
                              function(c, v) {c.push(v);},
                              function(w, h, r, c) {return r * w + c;}),
        'right': makeSequences(width, height, true,
                               function() { return []; },
                               function(c, v) {c.unshift(v);},
                               function(w, h, r, c) {return r * w + c;}),
        'up': makeSequences(width, height, false,
                            function() { return []; },
                            function(c, v) {c.push(v);},
                            function(w, h, r, c) {return r + c * h;}),
        'down': makeSequences(width, height, false,
                              function() { return []; },
                              function(c, v) {c.unshift(v);},
                              function(w, h, r, c) {return r + c * h;})
    };
    function collapseBySequence(b, s) {
        var l = 0,
            r = 0;
        for (r = 1; r < s.length; r++) {
            if (b[s[r]] === 0) {
                continue;
            }
            if (b[s[l]] === 0) {
                b[s[l]] = b[s[r]];
                b[s[r]] = 0;
                continue;
            }
            if (b[s[l]] === b[s[r]]) {
                b[s[l]] = b[s[l]] + b[s[r]];
                b[s[r]] = 0;
            }
            l = l + 1;
            r = l;
        }
    }
    function checkForMoves(b, s) {
        var l = 0,
            r = 0;
        for (r = 1; r < s.length; r++) {
            if (b[s[l]] === 0) {
                return true
            }
            if (b[s[l]] === b[s[r]]) {
                return true;
            }
            l = l + 1;
            r = l;
        }
        return false;
    }
    function checkSequencesForMoves() {
        for (var d in sequences) {
            for (var s in sequences[d])
                if (checkForMoves(board, sequences[d][s]))
                    return true;
        }
        return false;
    }
    function placeRandomIsh(board, allowedValues, sequences) {
        var i, c = [];
        for (var i = 0; i < board.length; i++) {
            if (board[i] === 0) {
                c.push(i);
            }
        }
        if (c.length === 0) {
            return checkSequencesForMoves();
        } else {
            var x = Math.floor(Math.random() * c.length);
            board[c[x]] = allowedValues[Math.floor(Math.random() * allowedValues.length)];
        }
        return true;
    }
    var board = [];
    for (var i = 0; i < (width * height); i++) {
        board.push(0);
    }
    function showBoard() {
        var line = "";
        for (var i = 0; i < board.length; i++) {
            if (i % width === 0) {
                console.log(line);
                line = "";
            }
            line += sprintf("%5d", board[i]);
        }
        console.log(line);
    }
    this.makeMove = function(d) {
        var updated = false;
        for (var s in sequences[d]) {
            updated = updated || checkForMoves(board, sequences[d][s]);
            collapseBySequence(board, sequences[d][s]);
        }
        if (updated)
            placeRandomIsh(board, [2,2,2,2,4], sequences);
        if (!checkSequencesForMoves())
            console.log("Game Over")
        showBoard();
    }
    placeRandomIsh(board, [2], sequences);
    placeRandomIsh(board, [2], sequences);
    showBoard();
}
var game = new Game(4,4);

stdin.on('data', function (key) {
    if (key == '\u0003') process.exit();
    if (key == 'w') game.makeMove("up");
    if (key == 'a') game.makeMove("left");
    if (key == 's') game.makeMove("down");
    if (key == 'd') game.makeMove("right");
});
