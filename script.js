const chessboard_wrapper = document.getElementById("chessboard-wrapper");

function colToFile(col) {
    let file = "";
    col += 1; 

    while (col > 0) {
        col--; 
        file = String.fromCharCode(97 + (col % 26)) + file; 
        col = Math.floor(col / 26);
    }

    return file;
}

function fileToCol(file) {
    let col = 0;
    for (let i = 0; i < file.length; i++) {
        col *= 26;
        col += (file.charCodeAt(i) - 97 + 1);
    }
    return col - 1;
}

function createSquare(color, row, col, boardSize) {
    const square = document.createElement("div");
    square.classList.add("chess-square");
    square.style.background = color;

    square.style.gridRowStart = row + 1;
    square.style.gridColumnStart = col + 1;

    const rank = row + 1;
    const file = colToFile(col);
    const coord = `${file}${rank}`;
    square.id = coord;

    const label = document.createElement("div");
    label.classList.add("coord-label");
    label.textContent = coord;
    square.appendChild(label);

    const piece = getInitialPiece(coord);
    if (piece) {
        const pieceDiv = document.createElement("div");
        pieceDiv.classList.add("piece");
        pieceDiv.textContent = piece.symbol;
        pieceDiv.dataset.color = piece.color;
        pieceDiv.dataset.type = piece.type;
        pieceDiv.draggable = true;
        square.appendChild(pieceDiv);
    }

    chessboard_wrapper.appendChild(square);
}

function getInitialPiece(coord) {
    const position = {
        // White
        'a1': { symbol: '♖', type: 'rook', color: 'white' },
        'b1': { symbol: '♘', type: 'knight', color: 'white' },
        'c1': { symbol: '♗', type: 'bishop', color: 'white' },
        'd1': { symbol: '♕', type: 'queen', color: 'white' },
        'e1': { symbol: '♔', type: 'king', color: 'white' },
        'f1': { symbol: '♗', type: 'bishop', color: 'white' },
        'g1': { symbol: '♘', type: 'knight', color: 'white' },
        'h1': { symbol: '♖', type: 'rook', color: 'white' },
        'a2': { symbol: '♙', type: 'pawn', color: 'white' },
        'b2': { symbol: '♙', type: 'pawn', color: 'white' },
        'c2': { symbol: '♙', type: 'pawn', color: 'white' },
        'd2': { symbol: '♙', type: 'pawn', color: 'white' },
        'e2': { symbol: '♙', type: 'pawn', color: 'white' },
        'f2': { symbol: '♙', type: 'pawn', color: 'white' },
        'g2': { symbol: '♙', type: 'pawn', color: 'white' },
        'h2': { symbol: '♙', type: 'pawn', color: 'white' },

        // Black
        'a8': { symbol: '♜', type: 'rook', color: 'black' },
        'b8': { symbol: '♞', type: 'knight', color: 'black' },
        'c8': { symbol: '♝', type: 'bishop', color: 'black' },
        'd8': { symbol: '♛', type: 'queen', color: 'black' },
        'e8': { symbol: '♚', type: 'king', color: 'black' },
        'f8': { symbol: '♝', type: 'bishop', color: 'black' },
        'g8': { symbol: '♞', type: 'knight', color: 'black' },
        'h8': { symbol: '♜', type: 'rook', color: 'black' },
        'a7': { symbol: '♟', type: 'pawn', color: 'black' },
        'b7': { symbol: '♟', type: 'pawn', color: 'black' },
        'c7': { symbol: '♟', type: 'pawn', color: 'black' },
        'd7': { symbol: '♟', type: 'pawn', color: 'black' },
        'e7': { symbol: '♟', type: 'pawn', color: 'black' },
        'f7': { symbol: '♟', type: 'pawn', color: 'black' },
        'g7': { symbol: '♟', type: 'pawn', color: 'black' },
        'h7': { symbol: '♟', type: 'pawn', color: 'black' }
    };
    return position[coord] || null;
}

function toggleCoordinates(show) {
    document.querySelectorAll('.coord-label').forEach(label => {
        label.style.display = show ? 'block' : 'none';
    });
}

function DestroyChessboard(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function isLegalMove(type, color, from, to) {
    const fromMatch = from.match(/^([a-z]+)(\d+)$/);
    const toMatch = to.match(/^([a-z]+)(\d+)$/);
    if (!fromMatch || !toMatch) return false;

    const fx = fileToCol(fromMatch[1]);
    const fy = parseInt(fromMatch[2], 10);
    const tx = fileToCol(toMatch[1]);
    const ty = parseInt(toMatch[2], 10);

    const dx = tx - fx;
    const dy = ty - fy;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const forward = color === 'white' ? 1 : -1;
    const startRow = color === 'white' ? 2 : 7;

    function isPathClear() {
        let stepX = dx === 0 ? 0 : dx / absDx;
        let stepY = dy === 0 ? 0 : dy / absDy;

        let x = fx + stepX;
        let y = fy + stepY;
        while (x !== tx || y !== ty) {
            const squareId = `${colToFile(x)}${y}`;
            const sq = document.getElementById(squareId);
            if (sq && sq.querySelector('.piece')) return false;
            x += stepX;
            y += stepY;
        }
        return true;
    }

    const toSquare = document.getElementById(to);
    const targetPiece = toSquare ? toSquare.querySelector('.piece') : null;
    const isCapture = targetPiece && targetPiece.dataset.color !== color;

    switch (type) {
        case 'pawn':
            if (dx === 0) {
                if (dy === forward && !targetPiece) return true;
                if (dy === 2 * forward && fy === startRow && !targetPiece) {
                    const intermediateSquare = `${colToFile(fx)}${fy + forward}`;
                    if (!document.getElementById(intermediateSquare).querySelector('.piece'))
                        return true;
                }
            }
            if (absDx === 1 && dy === forward && isCapture) return true;
            return false;

        case 'rook':
            if (dx !== 0 && dy !== 0) return false;
            if (!isPathClear()) return false;
            return true;

        case 'knight':
            return (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2);

        case 'bishop':
            if (absDx !== absDy) return false;
            if (!isPathClear()) return false;
            return true;

        case 'queen':
            if (dx === 0 || dy === 0 || absDx === absDy) {
                if (!isPathClear()) return false;
                return true;
            }
            return false;

        case 'king':
            if (absDx <= 1 && absDy <= 1) return true;
            return false;

        default:
            return false;
    }
}

function setupDragAndDrop() {
    let draggedPiece = null;
    let sourceSquare = null;

    function clearHighlights() {
        document.querySelectorAll('.legal-move-highlight').forEach(sq => {
            sq.classList.remove('legal-move-highlight');
        });
    }

    function highlightLegalMoves(type, color, from) {
        const squares = document.querySelectorAll('.chess-square');
        squares.forEach(square => {
            const to = square.id;
            if (from !== to && isLegalMove(type, color, from, to)) {
                square.classList.add('legal-move-highlight');
            }
        });
    }

    document.querySelectorAll('.piece').forEach(piece => {
        piece.addEventListener('dragstart', e => {
            draggedPiece = e.target;
            sourceSquare = e.target.closest('.chess-square');

            clearHighlights();
            highlightLegalMoves(draggedPiece.dataset.type, draggedPiece.dataset.color, sourceSquare.id);

            setTimeout(() => {
                draggedPiece.style.display = 'none';
            }, 0);
        });

        piece.addEventListener('dragend', e => {
            draggedPiece.style.display = 'block';
            draggedPiece = null;
            sourceSquare = null;

            clearHighlights();
        });

        piece.addEventListener('click', e => {
            clearHighlights();
            const sq = e.target.closest('.chess-square');
            if (!sq) return;
            highlightLegalMoves(e.target.dataset.type, e.target.dataset.color, sq.id);
        });
    });

    document.querySelectorAll('.chess-square').forEach(square => {
        square.addEventListener('dragover', e => e.preventDefault());

        square.addEventListener('drop', e => {
            if (!draggedPiece || !sourceSquare) return;

            const from = sourceSquare.id;
            const to = square.id;
            const type = draggedPiece.dataset.type;
            const color = draggedPiece.dataset.color;

            const targetPiece = square.querySelector('.piece');
            const isCapturingOwn = targetPiece && targetPiece.dataset.color === color;

            if (!isCapturingOwn && isLegalMove(type, color, from, to)) {
                if (targetPiece) targetPiece.remove();
                square.appendChild(draggedPiece);
            }

            clearHighlights();
        });
    });

    chessboard_wrapper.addEventListener('click', e => {
        if (!e.target.classList.contains('piece')) {
            clearHighlights();
        }
    });
}

function CreateChessboard() {
    const sizeInputValue = document.getElementById("SizeInput").value;
    let size = parseInt(sizeInputValue, 10);
    if (isNaN(size) || size < 8) size = 8;

    DestroyChessboard(chessboard_wrapper);

    chessboard_wrapper.style.setProperty('--board-size', size);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const isWhite = (row + col) % 2 === 0;
            createSquare(isWhite ? "white" : "gray", row, col, size);
        }
    }

    setupDragAndDrop();

    const coordCheckbox = document.getElementById("CordsCheckbox");
    toggleCoordinates(coordCheckbox?.checked ?? true);
}

document.addEventListener("DOMContentLoaded", () => {
    const coordCheckbox = document.getElementById("CordsCheckbox");

    document.getElementById("SizeInput").value = 8;

    coordCheckbox?.addEventListener("change", e => {
        toggleCoordinates(e.target.checked);
    });
});
