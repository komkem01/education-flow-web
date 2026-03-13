# Education Flow - Web Application

ระบบบริหารจัดการโรงเรียนแบบครบวงจร สำหรับการจัดการข้อมูลโรงเรียนทุกด้าน

## 📋 ฟีเจอร์หลัก

### 🎯 บทบาทผู้ใช้งาน (Multi-Role System)

- **Admin (ผู้ดูแลระบบ)** - จัดการข้อมูลโรงเรียนทั้งระบบ
- **Staff (บุคคลากร)** - จัดการข้อมูลครู นักเรียน ผู้ปกครอง และอนุมัติคำขอ
- **Teacher (ครู)** - จัดการการสอน บันทึกคะแนน เช็คชื่อ
- **Student (นักเรียน)** - ดูตารางเรียน ผลการเรียน การเข้าเรียน
- **Parent (ผู้ปกครอง)** - ติดตามความเป็นไปของบุตรหลาน ชำระเงิน

### ✨ ฟีเจอร์สำคัญ

- ✅ ระบบ Multi-role - 1 คนมีได้หลายบทบาท (ยกเว้นนักเรียน)
- ✅ Role Switching - สลับบทบาทได้ง่าย
- ✅ ระบบอนุมัติคำขอ (Approval System)
- ✅ ระบบแจ้งเตือน (Notification System)
- ✅ จัดการข้อมูลโรงเรียน บุคคลากร ครู นักเรียน
- ✅ UI/UX ที่ทันสมัย ใช้งานง่าย เน้นทางการ

## 🛠 เทคโนโลยีที่ใช้

- **Framework**: Nuxt 3 (Vue 3)
- **UI**: Tailwind CSS
- **State Management**: Pinia
- **Icons**: Nuxt Icon (Lucide Icons)
- **TypeScript**: Full TypeScript Support
- **Font**: Prompt (Google Fonts)

## 📦 การติดตั้ง

```bash
# ติดตั้ง dependencies
yarn install

# รันโปรเจกต์ในโหมด development
yarn dev

# Build สำหรับ production
yarn build

# Preview production build
yarn preview
```

## 📁 โครงสร้างโปรเจกต์

```
education-flow-web/
├── assets/
│   └── css/
│       └── main.css              # Tailwind CSS และ Custom Styles
├── components/
│   └── UI/                       # Reusable UI Components
│       ├── Button.vue
│       ├── Table.vue
│       ├── Modal.vue
│       ├── Input.vue
│       ├── Select.vue
│       ├── Card.vue
│       ├── Badge.vue
│       └── Toast.vue
├── composables/
│   ├── useApi.ts                 # API Fetch Wrapper
│   └── useToast.ts               # Toast Notification
├── constants/
│   └── index.ts                  # Constants (API Endpoints, Routes, Menus)
├── layouts/
│   ├── admin.vue                 # Admin Layout (Sidebar + Navbar)
│   └── auth.vue                  # Auth Layout (Login)
├── middleware/
│   └── auth.ts                   # Authentication Middleware
├── pages/
│   ├── login.vue                 # Login Page
│   └── admin/
│       ├── index.vue             # Admin Dashboard
│       ├── schools.vue           # จัดการโรงเรียน
│       ├── staff.vue             # จัดการบุคคลากร
│       ├── teachers.vue          # จัดการครู
│       └── students.vue          # จัดการนักเรียน
├── stores/
│   ├── auth.ts                   # Authentication Store
│   └── notification.ts           # Notification Store
├── types/
│   └── index.ts                  # TypeScript Types & Interfaces
├── nuxt.config.ts                # Nuxt Configuration
├── tailwind.config.js            # Tailwind Configuration
└── package.json
```

## 🎨 การออกแบบ UI

### สีหลัก

- **Primary (น้ำเงิน)**: สำหรับปุ่มหลัก และองค์ประกอบสำคัญ
- **Secondary (เทา)**: สำหรับพื้นหลังและข้อความ
- **Success (เขียว)**: สำหรับสถานะสำเร็จ
- **Warning (เหลือง)**: สำหรับคำเตือน
- **Danger (แดง)**: สำหรับการลบและข้อผิดพลาด

### ปุ่มการดำเนินการ (Action Buttons)

- `btn-detail`: พื้นหลังขาว ขอบเทา - สำหรับดูรายละเอียด
- `btn-edit`: พื้นหลังน้ำเงินอ่อน - สำหรับแก้ไข
- `btn-delete`: พื้นหลังแดงอ่อน - สำหรับลบ

## 🔐 การตรวจสอบสิทธิ์

ระบบใช้ JWT Token สำหรับการตรวจสอบสิทธิ์:
- Access Token เก็บใน localStorage
- Refresh Token สำหรับต่ออายุ Access Token
- Middleware `auth.ts` ตรวจสอบการเข้าถึงหน้าต่างๆ

## 📝 หมายเหตุ

- ระบบนี้เป็นส่วน Frontend เท่านั้น ต้องเชื่อมต่อกับ Backend API
- ตั้งค่า API Base URL ใน `nuxt.config.ts` → `runtimeConfig.public.apiBase`
- ฟอนต์ Prompt จาก Google Fonts เหมาะสำหรับภาษาไทย

## 🚀 การพัฒนาต่อ

### หน้าที่ควรเพิ่มเติม

1. **Admin**
   - จัดการห้องเรียน (Classrooms)
   - จัดการรายวิชา (Subjects)
   - อนุมัติคำขอ (Approvals)
   - ตั้งค่าระบบ (Settings)

2. **Staff**
   - Dashboard สำหรับบุคคลากร
   - จัดการผู้ปกครอง
   - อนุมัติคำขอต่างๆ
   - จัดการเอกสาร

3. **Teacher**
   - Dashboard สำหรับครู
   - จัดการรายวิชาที่สอน
   - บันทึกคะแนน
   - เช็คชื่อนักเรียน

4. **Student**
   - Dashboard สำหรับนักเรียน
   - ดูตารางเรียน
   - ดูผลการเรียน
   - ดูการเข้าเรียน

5. **Parent**
   - Dashboard สำหรับผู้ปกครอง
   - ดูข้อมูลบุตรหลาน
   - ชำระค่าเทอม

## 📄 License

MIT License - พัฒนาโดย Education Flow Team
