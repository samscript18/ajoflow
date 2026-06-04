import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getPage(): string {
		return `<!DOCTYPE html>
      <html lang="en">
        <head>
        <meta charset="UTF-8" />
          <meta name="viewport" content = "width=device-width, initial-scale=1.0" />
            <title>AjoFlow API </title>
                <style>
                  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap");

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  font-family: "Poppins", sans-serif;
}

body {
  background-color: #f1f1f1;
}

.main-container {
  width: 100vw;
  height: 100vh;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

button {
  background-color: royalblue;
  color: white;
  border: none;
  outline: none;
  padding: 10px 1rem;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  transform: scale(0.97);
  opacity: 0.8;
}

.main-container>div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.main-container>div>p {
  font-weight: bold;
}

.main-container h2 {
  font-size: 2rem;
  text-transform: uppercase;
}
                </style>
                <link
      rel="stylesheet"
    href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    integrity = "sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
    crossorigin = "anonymous"
    referrerpolicy = "no-referrer"
      />
      </head>
      <body>
      <section class="main-container" >
        <h2>Welcome to AjoFlow API</h2>
          <a href ="/api/docs"><button>View Documentation</button></a>
            </section>
            </body>
            </html>`;
	}
}
