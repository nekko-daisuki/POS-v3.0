document.addEventListener('DOMContentLoaded', function() {
    const orderHistoryList = document.getElementById('orderHistoryList');
    const backToPosBtn = document.getElementById('backToPosBtn');

    // ★追加: ハンバーガーメニュー関連の要素取得
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    // ローカルストレージから注文履歴を取得
    let orderHistory = JSON.parse(localStorage.getItem('posOrderHistory')) || [];

    function displayOrderHistory() {
        orderHistoryList.innerHTML = ''; // 既存のリストをクリア

        if (orderHistory.length === 0) {
            orderHistoryList.innerHTML = '<p>注文履歴はありません。</p>';
            return;
        }

        // 最新の注文が上に表示されるように逆順にする
        orderHistory.slice().reverse().forEach((order, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const orderDate = new Date(order.timestamp).toLocaleString('ja-JP');
            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${orderDate}</span>
                    <span class="history-total">合計: ¥${order.totalAmount} (${order.totalCount}点)</span>
                </div>
                <ul class="history-items-detail">
                    ${order.items.map(item => `
                        <li>${item.name} x ${item.quantity} - ¥${item.price * item.quantity}</li>
                    `).join('')}
                </ul>
            `;
            orderHistoryList.appendChild(historyItem);
        });
    }

    // 履歴表示
    displayOrderHistory();

    // ★追加: ハンバーガーメニューのクリックイベント
    hamburgerMenu.addEventListener('click', function() {
        hamburgerMenu.classList.toggle('open');
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    // ★追加: オーバーレイのクリックイベント (メニューを閉じる)
    overlay.addEventListener('click', function() {
        hamburgerMenu.classList.remove('open');
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });

    // POSレジに戻るボタン
    backToPosBtn.addEventListener('click', function() {
        window.location.href = 'index.html'; // index.htmlに戻る
    });
});