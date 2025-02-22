print("hello world!")

# Function to find the nth Fibonacci number
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

# Find the 53rd Fibonacci number
fib_53 = fibonacci(53)
print("The 53rd Fibonacci number is:", fib_53)