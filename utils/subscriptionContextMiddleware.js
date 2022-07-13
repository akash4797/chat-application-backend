import jwt from "jsonwebtoken";

export async function subscriptionContextMiddleware(context) {
  if (context.connectionParams.Authorization) {
    const token = context.connectionParams.Authorization.split("Bearer ")[1];
    // @ts-ignore
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) context.user = null;
      context.user = decoded;
    });
  }

  return context;
}
