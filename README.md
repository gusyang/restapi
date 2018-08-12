# Subscribe related API 
## check subscribe
### check if email address in our database
  * Mathod: get
  * Uri: /api/email/:email

## opt in customer
### opt in email.
  * Mathod: post
  * Uri: /api/optin 
  * Content-Type: application/json

```javascript
    {
	"firstname":"Gus",
	"lastname":"Yangaa",
	"email":"test@gus.gus.net",
	"source":"mytestsource"
	
}
```
## Encrypt Email
### Encrypt string
* Mathod: get
* Uri: /api/encrypt/:email

## Decrypt Email
### Decrypt string
* Mathod: get
* Uri: /api/decrypt/:encryptst
