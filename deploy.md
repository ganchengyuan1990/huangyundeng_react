# 部署文档

### 配置说明
所有服务采用Docker Image的方式提供，因此部署的机器必须是Linux系统，或者是能提供DockerImage方式部署的云服务。

最低配置要求： 2核CPU、4G内存、500G以上的硬盘空间

### 部署流程

1. 确保Docker版本在20以上，docker-compose版本在v2.22以上。查看方式：`docker -v` `docker-compose -v`
2. 因为部署环境不带外网，因此需要将DockerImage导出成文件后，从U盘拷入。 DockerImage导出命令: `docker save -o 0.0.11.tar registry.cn-shanghai.aliyuncs.com/fangxt/fform:0.0.11 registry.cn-shanghai.aliyuncs.com/fangxt/backend:0.0.11 postgres:14 bitnami/minio:2023`
3. 将 docker-compose-fform.yml 连同刚刚导出的文件一同复制到待部署的机器上 
4. 将文件复制到待部署的机器后，docker load -i 文件名.tar
5. 创建一个.env文件，将正确的配置填入其中，格式参见文末
6. 运行命令 `docker-compose -f docker-compose-fform.yml up -d `启动所有服务。
7. 待一切服务都运行正常后（能从浏览器访问），再运行` docker exec -it devops-django-1 python3 manage.py createsuperuser`来创建管理员账号。
8. 创建完，还需要访问:9001设置Access Key，具体步骤：
   1. 打开:9001对应的页面，登录。fxt1u2849759 / fxt5798124709321
   2. 点击左侧菜单的Access Keys，在点击最右侧的按钮Create access key
   3. 填写Access Key为 fxt58107209584732 , Secret Key为 07def439b8251799e5b399c59ea4cd64 。
   4. 点击Create

.env样例：
```dotenv
version=0.0.11
site_url=https://aichan.info/（客户服务器的访问地址）
secret_key=django-insecure-^leio-ylom9bh…………（随意改一些）

DB_DEFAULT_HOST=db
DB_DEFAULT_PORT=5432

MINIO_ACCESS_KEY=fxt58107209584732
MINIO_SECRET_KEY=07def439b8251799e5b399c59ea4cd64

```
