let grid = [];
let interval;
let size = 30;
let isDragging = false;
let isPlacing = false; // セルを配置中かどうか
let lastTouchedCell = null; // 最後にタッチしたセル
let currentColor = '#00ff33'; // 初期色
let rule = 1; // 初期ルール
let speed = 100; // 初期スピード

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
                isPlacing = true;
                toggleCell(i, j, cell);
                lastTouchedCell = cell;
            });

            cell.addEventListener('mouseover', () => {
                if (isDragging && isPlacing) {
                    if (lastTouchedCell !== cell) {
                        toggleCell(i, j, cell);
                        lastTouchedCell = cell;
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
    cell.style.backgroundColor = grid[i][j] ? currentColor : '#2a2a2a'; // 色を設定
};

// グリッドを更新する関数
const updateGrid = () => {
    const newGrid = grid.map(arr => [...arr]);
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const aliveNeighbors = countAliveNeighbors(i, j);
            if (rule === 1) {
                // 法則1
                if (grid[i][j]) {
                    newGrid[i][j] = aliveNeighbors === 2 || aliveNeighbors === 3;
                } else {
                    newGrid[i][j] = aliveNeighbors === 3;
                }
            } else if (rule === 2) {
                // 法則2 (例: 生きているセルが1または4つの隣接セルを持つと生存)
                if (grid[i][j]) {
                    newGrid[i][j] = aliveNeighbors === 1 || aliveNeighbors === 4;
                } else {
                    newGrid[i][j] = aliveNeighbors === 3; // 死んでいるセルは常に3つの隣接セルで生存
                }
            } else if (rule === 3) {
                // 法則3 (例: 生きているセルが1または2つの隣接セルを持つと生存)
                if (grid[i][j]) {
                    newGrid[i][j] = aliveNeighbors === 1 || aliveNeighbors === 2;
                } else {
                    newGrid[i][j] = aliveNeighbors === 3 || aliveNeighbors === 4; // 死んでいるセルは常に3つの隣接セルで生存
                }
            } else if (rule === 4) {
                if (grid[i][j]) {
                    // 生きているセルが2または3つの隣接セルなら生存、4つ以上なら死亡
                    newGrid[i][j] = aliveNeighbors === 1 || aliveNeighbors === 2 ? true : false;
                } else {
                    // 死んでいるセルは、隣接する生きているセルが奇数個なら生存
                    newGrid[i][j] = aliveNeighbors === 1;
                }
            }
        }
    }
    
    grid = newGrid;
    renderGrid();
};

// 法則を切り替えるイベントリスナーを追加
document.getElementById('ruleSelect').addEventListener('change', (e) => {
    rule = parseInt(e.target.value); // 選択された法則を取得
});

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
        cell.style.backgroundColor = grid[i][j] ? currentColor : '#2a2a2a'; // 生きているセルの色を設定
    });
};

document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value; // カラーピッカーから色を取得
});

// ボタンにイベントリスナーを追加
document.getElementById('createGrid').addEventListener('click', () => {
    size = parseInt(document.getElementById('size').value);
    createGrid(size);
});

document.getElementById('speed').addEventListener('input', (e) => {
    speed = parseInt(e.target.value); // スピードを更新
    if (interval) {
        clearInterval(interval); // 既存のインターバルをクリア
        interval = setInterval(updateGrid, 1000 / speed); // 新しいスピードで再設定
    }
});

document.getElementById('start').addEventListener('click', () => {
    if (interval) return;
    interval = setInterval(updateGrid, 1000 / speed); // スピードを使用
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

