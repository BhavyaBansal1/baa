using System.Text.Json;
using System.Threading;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5000");

// CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://127.0.0.1:4200"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JSON stores
builder.Services.AddSingleton<JsonPortfolioStore>();
builder.Services.AddSingleton<JsonUserStore>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AngularApp");

// Redirect root to Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapGet("/api/status", () => "Portfolio Backend Running");


app.MapPost("/api/auth/signup", async (AuthRequest request, JsonUserStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.Email))
        return Results.BadRequest("Enter email");

    if (string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest("Enter password");

    if (string.IsNullOrWhiteSpace(request.Role))
        return Results.BadRequest("Select role");

    var users = await store.LoadAsync();

    var exists = users.Any(u =>
        u.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase));

    if (exists)
        return Results.BadRequest("User already exists");

    var user = new UserModel
    {
        Email = request.Email,
        Password = request.Password,
        Role = request.Role,
        Name = request.Email.Split("@")[0].Trim()
    };

    users.Add(user);

    await store.SaveAsync(users);

    return Results.Ok(new
    {
        Message = "Signup successful"
    });
})
.WithTags("Auth");

app.MapPost("/api/auth/login", async (AuthRequest request, JsonUserStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.Email))
        return Results.BadRequest("Enter email");

    if (string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest("Enter password");

    if (string.IsNullOrWhiteSpace(request.Role))
        return Results.BadRequest("Select role");

    var users = await store.LoadAsync();

    var user = users.FirstOrDefault(u =>
        u.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase)
        && u.Password == request.Password
        && u.Role == request.Role);

    if (user == null)
        return Results.BadRequest("Invalid credentials");

    return Results.Ok(new
    {
        Message = "Login successful",
        User = new
        {
            user.Email,
            user.Role,
            user.Name
        }
    });
})
.WithTags("Auth");


// =======================
// PORTFOLIO APIs
// =======================

app.MapGet("/api/holdings", async (JsonPortfolioStore store) =>
{
    var data = await store.LoadAsync();
    return Results.Ok(data.Holdings);
})
.WithTags("Portfolio");

app.MapGet("/api/balance", async (JsonPortfolioStore store) =>
{
    var data = await store.LoadAsync();
    return Results.Ok(data.BalanceAmount);
})
.WithTags("Portfolio");

app.MapGet("/api/transactions", async (JsonPortfolioStore store) =>
{
    var data = await store.LoadAsync();

    var transactions = data.Transactions
        .OrderByDescending(t => t.CurrentTime)
        .Take(5);

    return Results.Ok(transactions);
})
.WithTags("Portfolio");

app.MapPost("/api/portfolio/reset", async (JsonPortfolioStore store) =>
{
    var data = new PortfolioData
    {
        BalanceAmount = 10000,
        Holdings = [],
        Transactions = []
    };

    await store.SaveAsync(data);

    return Results.Ok(data);
})
.WithTags("Portfolio");

app.MapPost("/api/holdings/update-prices", async (JsonPortfolioStore store) =>
{
    var data = await store.LoadAsync();

    var random = new Random();

    foreach (var stock in data.Holdings)
    {
        var change = (decimal)(random.NextDouble() * 10 - 5);

        stock.Price = Math.Max(1, Math.Round(stock.Price + change));
        stock.CurrentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    await store.SaveAsync(data);

    return Results.Ok(data.Holdings);
})
.WithTags("Portfolio");


// =======================
// TRADE APIs
// =======================

app.MapPost("/api/trade/buy", async (TradeRequest request, JsonPortfolioStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.StockName))
        return Results.BadRequest("Enter stock name");

    if (request.Quantity <= 0)
        return Results.BadRequest("Quantity must be greater than zero");

    if (request.Price <= 0)
        return Results.BadRequest("Price must be greater than zero");

    var data = await store.LoadAsync();

    var cost = request.Quantity * request.Price;

    if (cost > data.BalanceAmount)
        return Results.BadRequest("Not enough balance");

    data.BalanceAmount -= cost;

    var existing = data.Holdings.FirstOrDefault(h =>
        h.StockName.Equals(request.StockName, StringComparison.OrdinalIgnoreCase));

    if (existing != null)
    {
        var oldValue = existing.Quantity * existing.AvgPrice;
        var newValue = request.Quantity * request.Price;

        existing.Quantity += request.Quantity;
        existing.Price = request.Price;
        existing.Type = request.Type;
        existing.CurrentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        existing.AvgPrice = Math.Round((oldValue + newValue) / existing.Quantity, 2);
    }
    else
    {
        data.Holdings.Add(new HoldingModel
        {
            StockName = request.StockName,
            Quantity = request.Quantity,
            Price = request.Price,
            AvgPrice = request.Price,
            Type = request.Type,
            CurrentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    data.Transactions.Add(new TransactionModel
    {
        StockName = request.StockName,
        Quantity = request.Quantity,
        Price = request.Price,
        Type = "Buy",
        CurrentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
    });

    await store.SaveAsync(data);

    return Results.Ok(data);
})
.WithTags("Trade");

app.MapPost("/api/trade/sell", async (TradeRequest request, JsonPortfolioStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.StockName))
        return Results.BadRequest("Enter stock name");

    if (request.Quantity <= 0)
        return Results.BadRequest("Quantity must be greater than zero");

    if (request.Price <= 0)
        return Results.BadRequest("Price must be greater than zero");

    var data = await store.LoadAsync();

    var existing = data.Holdings.FirstOrDefault(h =>
        h.StockName.Equals(request.StockName, StringComparison.OrdinalIgnoreCase));

    if (existing == null || existing.Quantity < request.Quantity)
        return Results.BadRequest("Not enough shares");

    existing.Quantity -= request.Quantity;
    existing.Price = request.Price;
    existing.CurrentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    if (existing.Quantity == 0)
    {
        data.Holdings.Remove(existing);
    }

    var amount = request.Quantity * request.Price;
    data.BalanceAmount += amount;

    data.Transactions.Add(new TransactionModel
    {
        StockName = request.StockName,
        Quantity = request.Quantity,
        Price = request.Price,
        Type = "Sell",
        CurrentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
    });

    await store.SaveAsync(data);

    return Results.Ok(data);
})
.WithTags("Trade");

app.Run();


// =======================
// PORTFOLIO JSON STORE
// =======================

public class JsonPortfolioStore
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonPortfolioStore(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "Data", "portfolio.json");
    }

    public async Task<PortfolioData> LoadAsync()
    {
        await _lock.WaitAsync();

        try
        {
            if (!File.Exists(_filePath))
            {
                var defaultData = GetDefaultData();
                await SaveInternalAsync(defaultData);
                return defaultData;
            }

            var json = await File.ReadAllTextAsync(_filePath);

            if (string.IsNullOrWhiteSpace(json))
            {
                var defaultData = GetDefaultData();
                await SaveInternalAsync(defaultData);
                return defaultData;
            }

            var data = JsonSerializer.Deserialize<PortfolioData>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? GetDefaultData();

            data.Holdings ??= [];
            data.Transactions ??= [];

            return data;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SaveAsync(PortfolioData data)
    {
        await _lock.WaitAsync();

        try
        {
            data.Holdings ??= [];
            data.Transactions ??= [];

            await SaveInternalAsync(data);
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task SaveInternalAsync(PortfolioData data)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await File.WriteAllTextAsync(_filePath, json);
    }

    private PortfolioData GetDefaultData()
    {
        return new PortfolioData
        {
            BalanceAmount = 10000,
            Holdings = [],
            Transactions = []
        };
    }
}


// =======================
// USER JSON STORE
// =======================

public class JsonUserStore
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonUserStore(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "Data", "users.json");
    }

    public async Task<List<UserModel>> LoadAsync()
    {
        await _lock.WaitAsync();

        try
        {
            if (!File.Exists(_filePath))
            {
                var users = new List<UserModel>();
                await SaveInternalAsync(users);
                return users;
            }

            var json = await File.ReadAllTextAsync(_filePath);

            if (string.IsNullOrWhiteSpace(json))
                return new List<UserModel>();

            return JsonSerializer.Deserialize<List<UserModel>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new List<UserModel>();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SaveAsync(List<UserModel> users)
    {
        await _lock.WaitAsync();

        try
        {
            await SaveInternalAsync(users);
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task SaveInternalAsync(List<UserModel> users)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);

        var json = JsonSerializer.Serialize(users, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await File.WriteAllTextAsync(_filePath, json);
    }
}


// =======================
// MODELS
// =======================

public class PortfolioData
{
    public decimal BalanceAmount { get; set; }
    public List<HoldingModel> Holdings { get; set; } = [];
    public List<TransactionModel> Transactions { get; set; } = [];
}

public class HoldingModel
{
    public string StockName { get; set; } = "";
    public int Quantity { get; set; }
    public long CurrentTime { get; set; }
    public string Type { get; set; } = "stock";
    public decimal Price { get; set; }
    public decimal AvgPrice { get; set; }
}

public class TransactionModel
{
    public string StockName { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string Type { get; set; } = "";
    public long CurrentTime { get; set; }
}

public class TradeRequest
{
    public string StockName { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string Type { get; set; } = "stock";
}

public class UserModel
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "";
    public string Name { get; set; } = "";
}

public class AuthRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "";
}