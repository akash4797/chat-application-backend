import jwt from "jsonwebtoken";

export async function contextMiddleware(context) {
  if (context.req && context.req.headers.authorization) {
    const token = context.req.headers.authorization.split("Bearer ")[1];
    // @ts-ignore
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) context.user = null;
      context.user = decoded;
    });
  }

  return context;
}
