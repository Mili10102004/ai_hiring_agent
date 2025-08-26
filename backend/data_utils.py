import os
import json

DATA_FILE = 'candidate_data.json'

# Simulated data storage

def store_candidate_info(session_id, info, answers):
    data = {
        'session_id': session_id,
        'info': info,
        'answers': answers
    }
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                all_data = json.load(f)
        else:
            all_data = []
        all_data.append(data)
        with open(DATA_FILE, 'w') as f:
            json.dump(all_data, f, indent=2)
    except Exception as e:
        pass  # For demo, ignore errors

def get_candidate_info(session_id):
    if not os.path.exists(DATA_FILE):
        return None
    with open(DATA_FILE, 'r') as f:
        all_data = json.load(f)
    for entry in all_data:
        if entry['session_id'] == session_id:
            return entry
    return None

def clear_session(session_id):
    # For demo, just ignore
    pass
