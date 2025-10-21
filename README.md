# Adam's Ocean Lab OAuth Server

## 部署到Vercel

### 步骤

1. **创建GitHub仓库**
   ```bash
   cd oauth-server
   git init
   git add .
   git commit -m "Initial OAuth server"
   gh repo create adams-ocean-lab-oauth --public --source=. --remote=origin --push
   ```

2. **部署到Vercel**
   - 访问: https://vercel.com
   - 点击 "Add New" → "Project"
   - 导入 `adams-ocean-lab-oauth` 仓库
   - 点击 "Deploy"

3. **配置环境变量**
   在Vercel项目设置中添加：
   - `OAUTH_CLIENT_ID`: 你的GitHub OAuth App Client ID
   - `OAUTH_CLIENT_SECRET`: 你的GitHub OAuth App Client Secret

4. **获取Vercel URL**
   部署完成后，你会得到一个URL，例如：
   `https://adams-ocean-lab-oauth.vercel.app`

5. **更新GitHub OAuth App**
   回到GitHub OAuth App设置，更新：
   - Authorization callback URL: `https://adams-ocean-lab-oauth.vercel.app/api/callback`

6. **更新CMS配置**
   在主项目的 `public/admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: adamchenlang/adams-ocean-lab
     branch: master
     base_url: https://adams-ocean-lab-oauth.vercel.app
     auth_endpoint: /api/auth
   ```

## 完成！

现在Adam可以访问 https://adamchenlang.com/admin 并用GitHub登录了！
