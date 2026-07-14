import app from "./app";

async function main() {
    try {
        app.listen(3000,()=>{
            console.log("Server is running on port 3000");
        })
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}
main();