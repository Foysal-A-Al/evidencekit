// Same public input contract and health behavior; only the supported price access changes.
export const health=()=>({ok:true});
export function quote(items){return {total:items.reduce((sum,item)=>sum+item.price*item.quantity,0)*1.2};}
