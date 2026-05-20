export const orderStyle = { asc: 'asc', desc: 'desc' };

export type IOrderStyle = (typeof orderStyle)[keyof typeof orderStyle];
