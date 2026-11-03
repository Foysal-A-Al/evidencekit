// Best-effort export protection. This is not a comprehensive secret scanner.
const token=/-----BEGIN (?:[A-Z ]*PRIVATE KEY)|\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})/i;
const assignment=/(["']?\b(?:[A-Za-z_][\w.-]*[_-])?(?:api[_-]?key|password|passwd|secret|access[_-]?token|auth[_-]?token|client[_-]?secret)\b["']?\s*[:=]\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\r\n,;}]+)/gi;
export function hasSensitive(text){
 if(token.test(text)||/\bBearer\s+[A-Za-z0-9._~-]{12,}/i.test(text)||/https?:\/\/[^\s/@]+:[^\s/@]+@/i.test(text))return true;
 for(const match of text.matchAll(assignment)){const v=match[2].trim().replace(/^["']|["']$/g,'');if(v.length>=1&&!/^(?:\[REDACTED\]|redacted|your[_-]|example|placeholder|process\.env\b|os\.(?:getenv|environ)\b|\$\{|None\b|null\b)/i.test(v))return true;}
 return false;
}
export function redact(text){return String(text).replace(assignment,(_,key)=>key+'[REDACTED]').replace(/\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})/g,'[REDACTED]').replace(/\bBearer\s+[^\s"']+/gi,'Bearer [REDACTED]').replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi,'$1[REDACTED]@').replace(/-----BEGIN ([A-Z ]*PRIVATE KEY)-----[\s\S]*?(?:-----END \1-----|$)/g,'[REDACTED PRIVATE KEY]');}
