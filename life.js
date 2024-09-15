let grid = [];
let interval;
let size = 10;
let isDragging = false;

const createGrid = (size) => {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 21px)`;
    grid = Array.from({ length: size }, () => Array(size).fill(false));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('mousedown', () => {
                isDragging = true;
                toggleCell(i, j, cell);
            });
            cell.addEventListener('mouseover', () => {
                if (isDragging) {
                    toggleCell(i, j, cell);
                }
            });
            cell.addEventListener('mouseup', () => {
                isDragging = false;
            });
            gridContainer.appendChild(cell);
        }
    }
};

const toggleCell = (i, j, cell) => {
    grid[i][j] = !grid[i][j];
    cell.classList.toggle('alive');
};

const updateGrid = () => {
    const newGrid = grid.map(arr => [...arr]);
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const aliveNeighbors = countAliveNeighbors(i, j);
            if (grid[i][j]) {
                newGrid[i][j] = aliveNeighbors === 2 || aliveNeighbors === 3;
            } else {
                newGrid[i][j] = aliveNeighbors === 3;
            }
        }
    }
    
    grid = newGrid;
    renderGrid();
};

const countAliveNeighbors = (x, y) => {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let count = 0;

    directions.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < size && newY >= 0 && newY < size && grid[newX][newY]) {
            count++;
        }
    });

    return count;
};

const renderGrid = () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const i = Math.floor(index / size);
        const j = index % size;
        cell.classList.toggle('alive', grid[i][j]);
    });
};

document.getElementById('createGrid').addEventListener('click', () => {
    size = parseInt(document.getElementById('size').value);
    createGrid(size);
});

document.getElementById('start').addEventListener('click', () => {
    if (interval) return;
    interval = setInterval(updateGrid, 100);
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
});

document.getElementById('reset').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    createGrid(size);
});

// 初期グリッド作成
createGrid(size);
