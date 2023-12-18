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
9. 运行命令，导入初始数据。 
   1. 运行`docker exec -it db psql -Upostgres`命令进入数据服务
   2. 运行`\c fangxt`选择要操作的数据库
   3. 粘贴后文中"需要导入的SQL语句"一节
   4. 运行成功后，`\q`退出数据服务

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

需要导入的SQL语句
```sql
INSERT INTO public.fform_forminterface (id, create_at, update_at, name) VALUES (1, '2023-11-26 22:24:20.407000 +00:00', '2023-11-26 22:24:21.426000 +00:00', '二手房转移登记');
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (56, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file11', '家庭成员（卖方夫妻双方）户口簿、身份证明、婚姻证明(结婚证、离婚证)', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (57, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file12', '购房发票、契税完税证明等房产原值、合理费用凭证', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (58, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file13', '关系材料(如结婚证、户口簿、出生证、人民法院判决书、人民法院调解书或者', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (1, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'receiver_partner_name', '领证人伴侣名字', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (2, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'receiver_partner_id_card_number', '领证人伴侣身份证号码', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (3, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'seller_partner_name', '卖方伴侣姓名', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (4, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'seller_partner_id_card_number', '卖方伴侣身份证号码', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (5, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file15', '确认书', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (6, '2023-12-15 21:52:39.181000 +00:00', '2023-12-15 21:52:39.181000 +00:00', 'seller_child_name', '卖方子女姓名', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (7, '2023-12-15 21:52:39.181000 +00:00', '2023-12-15 21:52:39.181000 +00:00', 'seller_child_id_card_number', '卖方子女身份证号码', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (27, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'seller_id_card_name', '卖方姓名', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (28, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'seller_id_card_number', '卖方身份证号', null, 'primary_string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (29, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'contract_number', '网签合同号', null, 'primary_string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (30, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq1', '1. 本次出售房屋是否为普通商品房住宅？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (31, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq2', '2. 是否提供购房发票扣减?', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (32, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq3', '3. 本次出售房屋面积面积为多少?', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (33, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq4', '4. 本次出售房屋持有时间（自购房之日起）？', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (34, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq51', '5. 出售方婚姻状况？', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (35, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq52', '是否存在未成年子女？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (36, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'sq6', '6. 本次出售的房屋是否为出售方家庭唯一住房？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (37, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'bq1', '1. 买方是否广州市户籍？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (38, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'bq21', '2. 买方婚姻状况？', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (39, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'bq22', '是否存在未成年子女？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (40, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'bq3', '3. 本次出售的房屋是否为购买方家庭唯一住房？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (41, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'bq4', '4. 本次交易是否属于近亲交易？', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (42, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'bq5', '是否同时办理银行抵押权登记', null, 'boolean', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (43, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'receiver_name', '领证人姓名', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (44, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'receiver_id_card_number', '领证人身份证号码', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (45, '2023-12-02 21:52:39.181000 +00:00', '2023-12-02 21:52:39.181000 +00:00', 'receiver_tel', '领证人手机联系方式', null, 'string', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (46, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file1', '广州市不动产登记申请表', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (47, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file2', '广州市不动不动产权属证明:《不动产权证书》，或《房地产权证》，或《共有权证', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (48, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file3', '身份证明（卖方）', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (49, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file4', '身份证明（买方）', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (50, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file5', '买卖合同', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (51, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file6', '《家庭成员情况申报表》', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (52, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file7', '家庭成员户口簿（原件）', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (53, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file8', '婚姻情况证明（结婚证、离婚证等）', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (54, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file9', '在本市缴交个人所得税或社会保险的缴纳证明', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (55, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file10', '卖方个人名下查询', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (59, '2023-12-03 21:21:01.706000 +00:00', '2023-12-03 21:21:01.706000 +00:00', 'file14', '若选择同时办理银行抵押权登记的，要额外提供广州市不动产登记申请表，按揭抵押合同等材料', null, 'file', '{}', 1);
INSERT INTO public.fform_formcolumn (id, create_at, update_at, key, name, tip, value_type, validator, form_interface_id) VALUES (60, '2023-12-15 21:52:39.181000 +00:00', '2023-12-15 21:52:39.181000 +00:00', 'seller_id_phone_number', '卖方联系方式', null, 'string', '{}', 1);

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
