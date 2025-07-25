def find_min_loss(prices):
    min_loss = float('inf')
    buy_year = sell_year = -1
    n = len(prices)  
    for i in range(n - 1):
        for j in range(i + 1, n):
            if prices[j] < prices[i]:  
                loss = prices[i] - prices[j]
                if loss < min_loss:
                    min_loss = loss
                    buy_year = i + 1
                    sell_year = j + 1

    if min_loss == float('inf'):
        return "No valid loss possible"
    return {
        "Buy Year": buy_year,
        "Buy Price": prices[buy_year - 1],
        "Sell Year": sell_year,
        "Sell Price": prices[sell_year - 1],
        "Minimum Loss": min_loss
    }
prices = list(map(int, input("Enter space-separated prices: ").split()))
result = find_min_loss(prices)
print(result)