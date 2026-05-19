const hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message:
        "Hola mundo - bienvenidos al curso de serverless framework en aws",
    }),
  };
};

const mundo = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hola mundo, segundo endpoint" }),
  };
};

module.exports = {
  hello,
  mundo,
};
