async function run() {
    try {
        // First register a user to make sure we have one for login
        const email = "debug_login_" + Date.now() + "@example.com";
        const password = "password123";

        console.log("Registering test user...");
        await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Debug Login User",
                email: email,
                password: password,
                role: "user"
            })
        });

        console.log("Attempting login...");
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
