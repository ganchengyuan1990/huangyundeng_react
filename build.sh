tag=$1
if [[ -z $tag ]]; then
  echo 'tag need'
  exit
fi
docker build --platform linux/amd64 -f backend/Dockerfile -t registry.cn-shanghai.aliyuncs.com/fangxt/backend:$tag ./backend/
docker push registry.cn-shanghai.aliyuncs.com/fangxt/backend:$tag

