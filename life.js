let grid = [];
let interval;
let size = 10;
let isDragging = false;
let isPlacing = false; // セルを配置中かどうか
let lastTouchedCell = null; // 最後にタッチしたセル

// グリッドを作成する関数
const createGrid = (size) => {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 21px)`;
    grid = Array.from({ length: size }, () => Array(size).fill(false));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            // セルをクリックまたはドラッグして設置する
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isDragging = true;
                isPlacing = true; // 配置開始
                toggleCell(i, j, cell);
                lastTouchedCell = cell; // 最後にタッチしたセルを記録
            });

            cell.addEventListener('mouseover', () => {
                if (isDragging && isPlacing) {
                    if (lastTouchedCell !== cell) { // 異なるセルの場合のみ
                        toggleCell(i, j, cell);
                        lastTouchedCell = cell; // 更新
                    }
                }
            });

            cell.addEventListener('mouseup', () => {
                isDragging = false;
                isPlacing = false; // 配置終了
                lastTouchedCell = null; // リセット
            });

            // タッチイベントを追加
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault(); // スクロール防止
                isDragging = true;
                isPlacing = true; // 配置開始
                toggleCell(i, j, cell);
                lastTouchedCell = cell; // 最後にタッチしたセルを記録
            });

            cell.addEventListener('touchmove', (e) => {
                e.preventDefault(); // スクロール防止
                if (isDragging && isPlacing) {
                    const touch = e.touches[0];
                    const newCell = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (newCell && newCell.classList.contains('cell') && lastTouchedCell !== newCell) {
                        const [i, j] = getCellIndex(newCell);
                        toggleCell(i, j, newCell);
                        lastTouchedCell = newCell; // 更新
                    }
                }
            });

            cell.addEventListener('touchend', () => {
                isDragging = false;
                isPlacing = false; // 配置終了
                lastTouchedCell = null; // リセット
            });

            gridContainer.appendChild(cell);
        }
    }
};

// セルのトグル機能
const toggleCell = (i, j, cell) => {
    grid[i][j] = !grid[i][j]; // 生死をトグル
    cell.classList.toggle('alive', grid[i][j]);
};

// グリッドを更新する関数
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

// 生存している隣接セルの数をカウント
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

// グリッドを描画する関数
const renderGrid = () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const i = Math.floor(index / size);
        const j = index % size;
        cell.classList.toggle('alive', grid[i][j]);
    });
};

// ボタンにイベントリスナーを追加
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

// ドキュメント全体でドラッグを管理
document.addEventListener('mouseup', () => {
    isDragging = false;
    isPlacing = false; // 配置終了
    lastTouchedCell = null; // リセット
});
document.addEventListener('mouseleave', () => {
    isDragging = false;
    isPlacing = false; // 配置終了
    lastTouchedCell = null; // リセット
});

// グリッド全体でドラッグを管理
const gridContainer = document.getElementById('grid');
gridContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    isPlacing = true; // 配置開始
});
gridContainer.addEventListener('mouseup', () => {
    isDragging = false;
    isPlacing = false; // 配置終了
    lastTouchedCell = null; // リセット
});
gridContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    isPlacing = false; // 配置終了
    lastTouchedCell = null; // リセット
});

// セルのインデックスを取得する関数
const getCellIndex = (cell) => {
    const index = Array.from(gridContainer.children).indexOf(cell);
    const i = Math.floor(index / size);
    const j = index % size;
    return [i, j];
};
let scrollInterval;

// スクロールボタンのイベントリスナーを追加
const controlButtons = document.querySelectorAll('.controls button');

controlButtons.forEach(button => {
    button.addEventListener('mousedown', (e) => {
        e.preventDefault(); // デフォルトの動作を防止
        startScrolling(button.id);
    });

    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // デフォルトの動作を防止
        startScrolling(button.id);
    });

    button.addEventListener('mouseup', stopScrolling);
    button.addEventListener('mouseleave', stopScrolling);
    
    button.addEventListener('touchend', stopScrolling);
    button.addEventListener('touchcancel', stopScrolling);
});

// スクロールを開始する関数
const startScrolling = (direction) => {
    if (scrollInterval) return; // 既にスクロール中の場合は何もしない
    scrollInterval = setInterval(() => {
        switch (direction) {
            case 'up':
                window.scrollBy(0, -10); // 上にスクロール
                break;
            case 'down':
                window.scrollBy(0, 10); // 下にスクロール
                break;
            case 'left':
                window.scrollBy(-10, 0); // 左にスクロール
                break;
            case 'right':
                window.scrollBy(10, 0); // 右にスクロール
                break;
        }
    }, 50); // 50msごとにスクロール
};

// スクロールを停止する関数
const stopScrolling = () => {
    clearInterval(scrollInterval);
    scrollInterval = null;
};

// ドキュメント全体でドラッグを管理
document.addEventListener('mouseup', stopScrolling);
document.addEventListener('mouseleave', stopScrolling);

// スクロールボタンのタッチイベントを追加
document.addEventListener('touchend', stopScrolling);
document.addEventListener('touchcancel', stopScrolling);
