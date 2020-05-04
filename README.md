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

## Git

+ Dont commit in VirtualBox

```bash
git add .
git commit -m "..."
git push origin master
git push heroku master
```
