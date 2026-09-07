import uuid


def test_create_enquiry_persists_valid_payload(client):
    payload = {
        "name": f"tscheck-contact-{uuid.uuid4().hex[:10]}",
        "phone": "+91 99530 48933",
        "program": "Beginner Classes",
        "message": "Please share a trial class schedule.",
    }
    response = client.post("/enquiries", json=payload)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["name"] == payload["name"]
    assert body["program"] == payload["program"]
    assert body["id"]
    assert body["created_at"]


def test_create_enquiry_rejects_empty_required_fields(client):
    response = client.post(
        "/enquiries",
        json={"name": "", "phone": "", "program": "", "message": ""},
    )
    assert response.status_code == 422, response.text
