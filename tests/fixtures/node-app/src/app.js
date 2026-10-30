export function route(method,path){
 if(method==='GET'&&path==='/health')return {status:200,body:{ok:true}};
 return {status:404,body:{error:'not found'}};
}
