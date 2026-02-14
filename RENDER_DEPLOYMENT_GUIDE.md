# 🚀 Render Deployment Guide

## 📋 Pre-deployment Checklist

### 1. Environment Variables Setup
Set these in your Render dashboard:

```
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
ALLOWED_HOSTS=your-app-name.onrender.com,your-custom-domain.com
DATABASE_URL=postgresql://postgres:3gUpmZftRQff8qEh@db.dnayjechvtorpnfjplhz.supabase.co:5432/postgres
DATABASE_PASSWORD=3gUpmZftRQff8qEh
```

### 2. Render Configuration

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

**Start Command:**
```bash
gunicorn exam_system.wsgi:application
```

**Python Version:** 3.14 (specified in runtime.txt)

### 3. Directory Structure for Render
```
your-repo/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── exam_system/
│   │   ├── settings.py
│   │   ├── settings_production.py
│   │   └── ...
│   └── ...
├── frontend/
└── render.yaml
```

### 4. Deployment Steps

1. **Connect Repository**: Link your GitHub repo to Render
2. **Create Web Service**: Choose Python environment
3. **Configure Build Settings**:
   - Root Directory: `backend/`
   - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start Command: `gunicorn exam_system.wsgi:application`
4. **Add Environment Variables** (as listed above)
5. **Deploy**: Click "Create Web Service"

### 5. Post-deployment Tasks

After successful deployment:

1. **Run Migrations**:
   ```bash
   render run python manage.py migrate
   ```

2. **Create Superuser**:
   ```bash
   render run python manage.py createsuperuser
   ```

3. **Test API Endpoints**:
   - Admin: `https://your-app-name.onrender.com/admin/`
   - API: `https://your-app-name.onrender.com/api/`

### 6. Common Issues & Solutions

**Static Files Not Loading:**
- Ensure `whitenoise` is in requirements.txt
- Check `STATIC_ROOT` configuration

**Database Connection Issues:**
- Verify Supabase project is active
- Check DATABASE_URL format
- Ensure SSL is required

**CORS Errors:**
- Update `CORS_ALLOWED_ORIGINS` in settings
- Add your frontend domain

### 7. Monitoring & Maintenance

- **Logs**: Check Render dashboard logs
- **Health Checks**: Configure in Render settings
- **Auto-deploys**: Enable for main branch
- **SSL**: Automatically handled by Render

### 8. Scaling Options

- **Free Tier**: Good for development/testing
- **Starter Tier**: $7/month for production
- **Pro Tier**: $29/month for high traffic

## 🛠️ Quick Commands

**Local Testing with Render-like Environment:**
```bash
export DEBUG=False
export SECRET_KEY=your-test-key
export ALLOWED_HOSTS=localhost,127.0.0.1
python manage.py runserver
```

**Check Production Readiness:**
```bash
python manage.py check --deploy
```

Need help? Check the Render documentation or contact their support!