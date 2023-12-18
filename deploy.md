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

MINIO_BASE_URL=https://aichan.info:9000/（客户服务器的访问地址，端口设置为9000）
MINIO_ACCESS_KEY=fxt58107209584732
MINIO_SECRET_KEY=07def439b8251799e5b399c59ea4cd64

```

### 附录：Docker安装简述

注！！！ 以下内容仅为某一种特殊情况，实际使用时需要根据客户的服务器具体决定安装方式。

Docker是一种开源平台，用于自动化应用程序的部署、扩展和管理。它通过容器化技术，将应用程序及其依赖项封装到一个独立的容器中，使其可以在不同的环境中运行。以下是在常见操作系统上安装Docker的基本步骤。

#### K8s

如果客户的环境是K8s，那么直接将 docker-compose-fform-v0.0.12.yml 所编排的服务与环境变量转化为k8s所需的格式导入即可。

#### 支持容器编排的环境

如果客户的环境支持容器编排，如微信云之类的，他们最重要的特征是有一个可视化的管理后台，并可以选择的以容器的方式启动虚拟机。

那么直接将 docker-compose-fform-v0.0.12.yml 所编排的服务与环境变量转化为挨个填入可视化界面中即可。

#### Ubuntu

1. 更新系统包列表：
   ```bash
   sudo apt update
   ```

2. 安装必要的软件包以允许APT使用HTTPS：
   ```bash
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   ```

3. 添加Docker的官方GPG密钥：
   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

4. 设置稳定版本的Docker存储库：
   ```bash
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

5. 安装Docker引擎：
   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io
   ```

6. 验证安装：
   ```bash
   sudo docker run hello-world
   ```

#### CentOS

1. 更新系统包列表：
   ```bash
   sudo yum update
   ```

2. 安装必要的软件包：
   ```bash
   sudo yum install -y yum-utils device-mapper-persistent-data lvm2
   ```

3. 设置Docker存储库：
   ```bash
   sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   ```

4. 安装Docker引擎：
   ```bash
   sudo yum install -y docker-ce docker-ce-cli containerd.io
   ```

5. 启动Docker服务：
   ```bash
   sudo systemctl start docker
   ```

6. 设置Docker开机自启：
   ```bash
   sudo systemctl enable docker
   ```

#### Windows

1. 下载并安装Docker Desktop，官方网址：[Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

2. 按照安装向导进行安装，启用Hyper-V和Windows容器功能。

3. 完成安装后，启动Docker Desktop。

4. 验证安装：
   打开命令提示符或PowerShell，并运行以下命令：
   ```bash
   docker run hello-world
   ```
   
#### Docker-compose的安装
Docker Compose是一个用于定义和运行多容器Docker应用程序的工具。以下是在常见操作系统上安装Docker Compose的基本步骤。

### Linux

在Linux系统上，您可以使用以下命令安装Docker Compose：

1. 下载最新版本的Docker Compose二进制文件：
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   ```

2. 授权二进制文件执行权限：
   ```bash
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. 验证安装：
   ```bash
   docker-compose --version
   ```
