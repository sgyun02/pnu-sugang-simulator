## Project Structure

```md

pnu-mock-sugang/
├── app.js                         # Express 서버 진입점 (미들웨어, 라우터, 서버 실행)
├── package.json                   # 프로젝트 정보 및 의존성 목록
├── package-lock.json              # 의존성 버전 고정
├── .gitignore                     # Git 추적 제외 파일 설정
├── .env.example                   # 환경 변수 예시 파일
├── schema.sql                     # MySQL 데이터베이스 스키마
│
├── config/                        # 서버 설정 관련 파일
│   ├── db.js                      # MySQL 연결 설정
│   └── passport.js                # Passport Local 인증 전략 설정
│
├── middleware/                    # 공통 미들웨어
│   └── auth.js                    # 로그인 여부 인증 미들웨어
│
├── routes/                        # Express 라우터
│   ├── auth.js                    # 로그인 / 회원가입 / 로그아웃 처리
│   ├── setting.js                 # 과목 관리 및 환경 설정 기능
│   └── sugang.js                  # 모의 수강신청 로직
│
├── public/                        # 정적 파일
│   ├── css/
│   │   └── style.css              # 공통 스타일시트
│   └── js/
│       └── sessionTimer.js        # 세션 만료 타이머 스크립트
│
└── views/                         # EJS 템플릿
    ├── partials/
    │   └── header.ejs             # 공통 헤더 레이아웃
    ├── login.ejs                  # 로그인 페이지
    ├── register.ejs               # 회원가입 페이지
    ├── setting.ejs                # 과목 / 환경 설정 페이지
    └── sugang.ejs                 # 수강신청 페이지

```