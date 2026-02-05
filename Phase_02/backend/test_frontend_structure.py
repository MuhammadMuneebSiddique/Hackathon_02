# Simple test to verify frontend structure
import os

def test_frontend_structure():
    """Verify that the frontend structure is properly set up"""
    frontend_paths = [
        "../frontend/app/page.tsx",
        "../frontend/app/login/page.tsx",
        "../frontend/app/register/page.tsx",
        "../frontend/app/dashboard/page.tsx",
        "../frontend/app/layout.tsx",
        "../frontend/components/LoginForm.tsx",
        "../frontend/components/RegisterForm.tsx",
        "../frontend/components/TaskForm.tsx",
        "../frontend/components/TaskItem.tsx",
        "../frontend/components/AuthGuard.tsx",
        "../frontend/lib/auth.tsx",
        "../frontend/lib/api.ts",
        "../frontend/types/task.ts"
    ]

    for path in frontend_paths:
        assert os.path.exists(path), f"Missing file: {path}"

    print("All frontend structure files exist")

if __name__ == "__main__":
    test_frontend_structure()
    print("All tests passed!")