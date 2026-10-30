import csv,io,hashlib,json,tempfile,datetime,pathlib
root=pathlib.Path(__file__).resolve().parents[3]/'tests/fixtures/experiment'
out=pathlib.Path(tempfile.mkdtemp(prefix='evidencekit-experiment-forward-'))
def parse(b): return list(csv.DictReader(io.StringIO(b.decode('utf-8'),newline='')))
def accuracy(rows):
    if not rows: raise ValueError('empty')
    return sum(r['y_true']==r['y_pred'] for r in rows)/len(rows)
def overlap(a,b,col): return set(r[col] for r in a)&set(r[col] for r in b)
def timestamp(s): return datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
# Hand-checked fixtures: exact identifiers remain distinct; accuracy is 1/2; chronology distinguishes ordered/equal/reversed.
assert overlap([{'id':'01'}],[{'id':'1'}],'id')==set()
assert overlap([{'id':' a'}],[{'id':'a'}],'id')==set()
assert overlap([{'id':'a'}],[{'id':'a'}],'id')=={'a'}
assert accuracy([{'y_true':'yes','y_pred':'yes'},{'y_true':'no','y_pred':'yes'}])==0.5
assert timestamp('2026-01-01T00:00:00Z') < timestamp('2026-01-02T00:00:00Z')
assert not timestamp('2026-01-02T00:00:00Z') < timestamp('2026-01-02T00:00:00Z')
assert not timestamp('2026-01-03T00:00:00Z') < timestamp('2026-01-02T00:00:00Z')
names=['README.md','train.csv','test.csv','predictions.csv']
raw={n:(root/n).read_bytes() for n in names}
train,test,pred=(parse(raw[n]) for n in names[1:])
metrics={'row_counts':{'train':len(train),'test':len(test),'predictions':len(pred)},'exact_full_row_overlap':len(set(tuple(r.items()) for r in train)&set(tuple(r.items()) for r in test)),'train_test_id_overlap':len(overlap(train,test,'id')),'train_test_subject_overlap':len(overlap(train,test,'subject')),'train_precedes_test':max(timestamp(r['time']) for r in train)<min(timestamp(r['time']) for r in test),'test_rows_not_after_all_training':sum(timestamp(r['time'])<=max(timestamp(t['time']) for t in train) for r in test),'prediction_ids_match_test':set(r['id'] for r in pred)==set(r['id'] for r in test),'duplicate_prediction_ids':len(pred)-len(set(r['id'] for r in pred)),'accuracy':accuracy(pred),'correct_predictions':sum(r['y_true']==r['y_pred'] for r in pred),'positive_label_in_truth':any(r['y_true']=='yes' for r in pred),'positive_label_in_prediction':any(r['y_pred']=='yes' for r in pred)}
assert metrics['row_counts']=={'train':2,'test':2,'predictions':2}
assert metrics['train_test_id_overlap']==1 and metrics['train_test_subject_overlap']==1
assert metrics['exact_full_row_overlap']==0 and metrics['accuracy']==0.5
assert not metrics['train_precedes_test'] and metrics['test_rows_not_after_all_training']==1
assert metrics['prediction_ids_match_test'] and metrics['duplicate_prediction_ids']==0
assert all((root/n).read_bytes()==raw[n] for n in names), 'Input changed during audit'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
hashes={n:hashlib.sha256(raw[n]).hexdigest() for n in names}
(out/'checks.json').write_text(json.dumps({'collected_at':now,'method':'Python standard library; hand-checked fixtures passed before analysis; exact unmodified CSV strings; SHA-256 of the byte snapshots parsed; reread equality passed','metrics':metrics,'sha256':hashes},indent=2)+'\n')
# Retention-only output: original report/prompt generation was omitted.
print(json.dumps({'output_directory':str(out),'metrics':metrics},indent=2))
