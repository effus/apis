# API

## deploy

```bash
git push heroku master
```

## local

```bash
heroku local web
```

## watch

```bash
nodemon --exec "heroku local web > api.log" --signal SIGTERM
```
