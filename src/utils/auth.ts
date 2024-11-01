import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  tenantId: string;
  roles: string[];
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  return decoded;
}; 