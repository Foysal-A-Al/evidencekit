// Controlled AI-authored fixture: intentionally reads a nonexistent price shape.
export const health=()=>({ok:true});
export function quote(items){return {total:items.reduce((sum,item)=>sum+item.unitPrice.amount*item.quantity,0)*1.2};}
