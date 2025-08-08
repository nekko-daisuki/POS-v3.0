document.addEventListener('DOMContentLoaded', function() {
    let menuItems = {}; // ローカルストレージから読み込むためletに変更

    // デフォルトのメニューデータを定義 (ローカルストレージが空の場合に使用)
    const defaultMenuItems = {
        'coffee': [
            { id: 'lightRoast', name: '浅煎り', price: 400, category: 'coffee' },
            { id: 'darkRoast', name: '深煎り', price: 400, category: 'coffee' },
            { id: 'premium', name: 'プレミアム', price: 500, category: 'coffee' },
            { id: 'decaf', name: 'デカフェ', price: 400, category: 'coffee' },
            { id: 'iceCoffee', name: 'アイスコーヒー', price: 400, category: 'coffee' },
            { id: 'iceLatte', name: 'アイスカフェオレ', price: 450, category: 'coffee' }
        ],
        'softDrink': [
            { id: 'lemonade', name: 'レモネード', price: 300, category: 'softDrink' },
            { id: 'appleJuice', name: 'アップルジュース', price: 300, category: 'softDrink' },
            { id: 'icedTea', name: 'アイスティー', price: 300, category: 'softDrink' },
            { id: 'milk', name: 'アイスミルク', price: 300, category: 'softDrink' }
        ],
        'food': [
            { id: 'chocolate', name: 'チョコレート', price: 150, category: 'food' },
            { id: 'cookie', name: 'クッキー', price: 150, category: 'food' },
            { id: 'madeleine', name: 'マドレーヌ', price: 150, category: 'food' },
            { id: 'financier', name: 'フィナンシェ', price: 150, category: 'food' }
        ],
        'other': [
            { id: 'dip', name: 'ディップ', price: 200, category: 'other' },
            { id: 'dipx5', name: 'ディップ ×5', price: 1000, category: 'other' },
            { id: 'sticker', name: 'ステッカー', price: 100, category: 'other' }
        ]
    };

    // ローカルストレージからメニューデータを読み込む、なければデフォルトを保存して使用
    function loadMenuItems() {
        const storedMenu = localStorage.getItem('posMenuItems');
        if (storedMenu) {
            menuItems = JSON.parse(storedMenu);
        } else {
            menuItems = defaultMenuItems;
            localStorage.setItem('posMenuItems', JSON.stringify(defaultMenuItems));
        }
    }

    // カテゴリ表示名を取得
    function getCategoryDisplayName(category) {
        switch (category) {
            case 'coffee': return 'コーヒー';
            case 'softDrink': return 'ソフト<br>ドリンク';
            case 'food': return 'フード';
            case 'other': return 'その他';
            default: return category;
        }
    }

    // カテゴリボタンのクラス名を取得 (色分け用)
    function getCategoryClass(category) {
        switch (category) {
            case 'coffee': return 'red';
            case 'softDrink': return 'blue';
            case 'food': return 'orange';
            case 'other': return 'green';
            default: return '';
        }
    }

    // メニューパネルを動的にレンダリングする関数
    function renderMenuPanel() {
        const menuPanel = document.querySelector('.menu-panel');
        menuPanel.innerHTML = ''; // 既存のメニューをクリア

        // menuItemsオブジェクトのキー (カテゴリ) の順序を定義
        const categoryOrder = ['coffee', 'softDrink', 'food', 'other'];

        categoryOrder.forEach(categoryKey => {
            const group = document.createElement('div');
            group.className = 'product-group';

            // カテゴリボタン
            const categoryButton = document.createElement('button');
            categoryButton.className = `product-category-button ${getCategoryClass(categoryKey)}`;
            categoryButton.setAttribute('data-category', categoryKey);
            categoryButton.innerHTML = getCategoryDisplayName(categoryKey);
            group.appendChild(categoryButton);

            const itemsInCategory = menuItems[categoryKey] || [];

            // カテゴリ内の商品ボタン
            // 最大4つの商品ボタンを表示し、残りはemptyボタンで埋める
            for (let i = 0; i < 4; i++) {
                if (itemsInCategory[i]) {
                    const item = itemsInCategory[i];
                    const productButton = document.createElement('button');
                    productButton.className = 'product-button';
                    productButton.setAttribute('data-item-id', item.id);
                    productButton.innerHTML = item.name.replace(' ', '<br>'); // 名前が長い場合は改行
                    group.appendChild(productButton);
                } else {
                    // 商品がない場合は空のボタンで埋める
                    const emptyButton = document.createElement('button');
                    emptyButton.className = 'product-button empty';
                    group.appendChild(emptyButton);
                }
            }
            menuPanel.appendChild(group);
        });

        // 動的に追加された商品ボタンにイベントリスナーを再設定
        attachProductButtonListeners();
    }


    // 注文データを保持する配列
    let orderItems = [];
    let totalAmount = 0;
    let totalCount = 0;
    let receivedAmount = 0;

    // DOM要素の取得
    const orderList = document.getElementById('orderList');
    const orderSummary = document.getElementById('orderSummary');
    const paymentBtn = document.getElementById('paymentBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const paymentScreen = document.getElementById('paymentScreen');
    const paymentTotal = document.getElementById('paymentTotal');
    const receivedAmountDisplay = document.getElementById('receivedAmount');
    const numKeys = document.querySelectorAll('.num-key');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    const completeBtn = document.getElementById('completeBtn');

    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    // 会計画面が最初から表示されないようにする
    paymentScreen.classList.add('hidden');

    // ハンバーガーメニューのクリックイベント
    hamburgerMenu.addEventListener('click', function() {
        hamburgerMenu.classList.toggle('open');
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    // オーバーレイのクリックイベント (メニューを閉じる)
    overlay.addEventListener('click', function() {
        hamburgerMenu.classList.remove('open');
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });


    // メニューアイテムのクリックイベントをアタッチする関数
    function attachProductButtonListeners() {
        document.querySelectorAll('.product-button').forEach(btn => {
            // 既存のイベントリスナーを削除 (複数回アタッチされるのを防ぐため)
            btn.removeEventListener('click', handleProductButtonClick);
            // 新しいイベントリスナーを追加
            btn.addEventListener('click', handleProductButtonClick);
        });
    }

    // 商品ボタンクリック時の処理
    function handleProductButtonClick() {
        const itemId = this.getAttribute('data-item-id');
        if (!itemId) return; // emptyボタンの場合は何もしない

        let itemFound = false;
        let item = null;
        for (const category in menuItems) {
            item = menuItems[category].find(menuItem => menuItem.id === itemId);
            if (item) {
                itemFound = true;
                break;
            }
        }

        if (itemFound) {
            const itemName = item.name;
            const itemPrice = item.price;

            const existingItemIndex = orderItems.findIndex(orderItem => orderItem.name === itemName);

            if (existingItemIndex !== -1) {
                orderItems[existingItemIndex].quantity++;
            } else {
                orderItems.push({
                    id: item.id, // IDも保存
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }
            updateOrderList();
        } else {
            console.error('指定されたIDのアイテムが見つかりません:', itemId);
        }
    }


    // 注文リストの更新関数
    function updateOrderList() {
        orderList.innerHTML = '';

        totalAmount = 0;
        totalCount = 0;

        orderItems.forEach((item, index) => {
            const orderItemElement = document.createElement('div');
            orderItemElement.className = 'order-item';

            const nameElement = document.createElement('div');
            nameElement.className = 'item-name';
            nameElement.textContent = `${item.name}`;

            const quantityControl = document.createElement('div');
            quantityControl.className = 'item-quantity-control';

            const minusBtn = document.createElement('button');
            minusBtn.className = 'quantity-button';
            minusBtn.textContent = '-';
            minusBtn.addEventListener('click', function() {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    orderItems.splice(index, 1);
                }
                updateOrderList();
            });

            const quantityDisplay = document.createElement('div');
            quantityDisplay.className = 'quantity-display';
            quantityDisplay.textContent = item.quantity;

            const plusBtn = document.createElement('button');
            plusBtn.className = 'quantity-button';
            plusBtn.textContent = '+';
            plusBtn.addEventListener('click', function() {
                item.quantity++;
                updateOrderList();
            });

            quantityControl.appendChild(minusBtn);
            quantityControl.appendChild(quantityDisplay);
            quantityControl.appendChild(plusBtn);

            orderItemElement.appendChild(nameElement);
            orderItemElement.appendChild(quantityControl);

            orderList.appendChild(orderItemElement);

            totalAmount += item.price * item.quantity;
            totalCount += item.quantity;
        });

        orderSummary.textContent = `${totalCount}点 合計 ¥${totalAmount}`;
    }

    // 注文取り消しボタンのクリックイベント
    cancelOrderBtn.addEventListener('click', function() {
        orderItems = [];
        updateOrderList();
    });

    // 支払いボタンのクリックイベント
    paymentBtn.addEventListener('click', function() {
        if (orderItems.length === 0) {
            alert('注文アイテムがありません');
            return;
        }

        paymentScreen.classList.remove('hidden');
        paymentTotal.textContent = `合計 ¥${totalAmount}`;
        receivedAmount = 0;
        updatePaymentDisplay();
    });

    // 数字キーパッドのクリックイベント
    numKeys.forEach(key => {
        key.addEventListener('click', function() {
            const keyValue = this.textContent;

            if (keyValue === 'C') {
                receivedAmount = 0;
            } else if (keyValue === '00') {
                receivedAmount = receivedAmount * 100;
            } else {
                receivedAmount = receivedAmount * 10 + parseInt(keyValue);
            }

            updatePaymentDisplay();
        });
    });

    // 支払い表示の更新関数
    function updatePaymentDisplay() {
        receivedAmountDisplay.textContent = `¥${receivedAmount}`;
        const change = receivedAmount - totalAmount;

        if (change < 0) {
            completeBtn.disabled = true;
            completeBtn.style.opacity = 0.5;
        } else {
            completeBtn.disabled = false;
            completeBtn.style.opacity = 1;
        }
    }

    // 支払いキャンセルボタンのクリックイベント
    cancelPaymentBtn.addEventListener('click', function() {
        paymentScreen.classList.add('hidden');
    });

    // 会計完了ボタンのクリックイベント
    completeBtn.addEventListener('click', function() {
        if (receivedAmount < totalAmount) {
            alert('預り金額が不足しています');
            return;
        }

        const changeAmount = receivedAmount - totalAmount;

        // 注文履歴をローカルストレージに保存
        const orderRecord = {
            timestamp: new Date().toISOString(),
            items: orderItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
            totalAmount: totalAmount,
            totalCount: totalCount,
            receivedAmount: receivedAmount,
            changeAmount: changeAmount
        };
        saveOrderToHistory(orderRecord);

        // スプレッドシートに送信する処理
        try {
            saveToSpreadsheet();

            orderItems = [];
            updateOrderList();

            paymentScreen.classList.add('hidden');

            alert('支払いが完了しました。\nおつり：¥' + changeAmount);
        } catch (error) {
            alert('エラーが発生しました: ' + error.message);
        }
    });

    // スプレッドシートに送信する関数
    function saveToSpreadsheet() {
        fetch('https://script.google.com/macros/s/AKfycby4Q9CaF1tSf3HsdS2aHIZOIfTZBKLutsSJwtq2WD8ZiVAL-aZR3WFpWbBYh8Xgym6d/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    items: orderItems,
                    totalAmount: totalAmount,
                    totalCount: totalCount,
                    receivedAmount: receivedAmount,
                    changeAmount: receivedAmount - totalAmount
                })
            })
            .then(response => console.log('注文データを送信しました'))
            .catch(error => console.error('エラー:', error));
    }

    // 注文履歴をローカルストレージに保存する関数
    function saveOrderToHistory(order) {
        let history = JSON.parse(localStorage.getItem('posOrderHistory')) || [];
        history.push(order);
        localStorage.setItem('posOrderHistory', JSON.stringify(history));
    }

    // ページロード時にメニューデータをロードし、パネルをレンダリング
    loadMenuItems();
    renderMenuPanel();

});

