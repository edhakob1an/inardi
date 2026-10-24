import json, urllib.request, time
K=json.load(open('/home/claude/nardi/server/public_keys.json'))
URL='https://fihtbfwibprcnhxiozux.supabase.co'; KEY=K.get('publishable') or K.get('key') or list(K.values())[0]
def req(path, body, tok=None):
    h={'apikey':KEY,'Content-Type':'application/json'}
    if tok: h['Authorization']='Bearer '+tok
    r=urllib.request.Request(URL+path, data=json.dumps(body).encode(), headers=h, method='POST')
    try:
        with urllib.request.urlopen(r, timeout=60) as f: return json.loads(f.read())
    except urllib.error.HTTPError as e: return json.loads(e.read() or b'{}')
def user():
    r=req('/auth/v1/signup', {}); return r['access_token'], r['user']['id']
api=lambda tok,a,**k: req('/functions/v1/game', {'action':a, **k}, tok)
A,ua=user(); B,ub=user()
me=api(A,'me'); print('me keys', sorted(me), 'daily', me['daily'], 'lvl', me['profile']['level'], me['profile']['xp'])
c=api(A,'claim_daily'); print('claim', c.get('day'), c.get('reward'), c.get('error'), 'coins', c['profile']['coins'], 'daily', c['daily'])
print('claim again', api(A,'claim_daily').get('error'))
print('bot win', api(A,'bot_result', won=True, mars=False).get('xp'))
print('bot again (too soon)', api(A,'bot_result', won=True).get('error'))
print('add stranger', api(A,'friend_add', user_id=ub).get('error'))
# play an invite game A vs B, B resigns quickly
g=api(A,'invite_create', variant='short')['game']; j=api(B,'invite_join', code=g['invite_code']); print('levels in game', j['game']['p0_level'], j['game']['p1_level'])
print('resign', api(B,'resign', game_id=g['id'])['game']['status'])
print('xp after quick resign A/B', api(A,'me')['profile']['xp'], api(B,'me')['profile']['xp'])
print('add after game', [ (f['name'],f['state']) for f in api(A,'friend_add', user_id=ub)['friends']])
print('B sees', [ (f['name'],f['state'],f['online']) for f in api(B,'friends')['friends']])
print('B adds back', [ (f['state'],f['online']) for f in api(B,'friend_add', user_id=ua)['friends']])
# rematch: A asks, B sees invite, B accepts
r1=api(A,'rematch', game_id=g['id']); print('A rematch', 'waiting' in r1, r1.get('error'))
print('B pending', [(i['p0_name'], i['rematch_of']==g['id']) for i in api(B,'ping')['invites']])
r2=api(B,'rematch', game_id=g['id']); print('B accepts ->', r2.get('game',{}).get('status'), r2.get('error'))
gid=r2['game']['id']; print('A resigns rematch', api(A,'resign', game_id=gid)['game']['status'])
# friend invite
fi=api(A,'invite_create', variant='long', friend_id=ub); print('friend invite', fi.get('game',{}).get('invited')==ub, fi.get('error'))
print('B pending', [i['variant'] for i in api(B,'ping')['invites']])
print('B declines', api(B,'invite_decline', game_id=fi['game']['id']))
print('leaderboard', json.dumps(api(A,'leaderboard', board='wins'))[:300])
