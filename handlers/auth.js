exports.login = async (event) => {
  const body = JSON.parse(event.body || "{}");

  const { username, password } = body;

  if (username === "admin" && password === "Batoi@1234") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login correcto",
        token: "fake-jwt-token",
      }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({
      message: "Credenciales incorrectos",
    }),
  };
};
