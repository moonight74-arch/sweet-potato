# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 고구마마켓

중고 물품을 사고팔 수 있는 웹 서비스.

## 기술 스택

- **Next.js** (App Router)
- **Supabase** (데이터베이스, 인증)
- **Tailwind CSS** (스타일링)
- **TypeScript**

## MCP

Supabase MCP 연결됨 — DB 조작 시 MCP를 통해 직접 수행

## 규칙

- 한국어 UI
- 가격은 원화(₩) — "₩10,000" 형태로 표시
- 모바일 반응형 필수
- 디자인은 깔끔하고 모던한 스타일
- 색상 테마: 주황색 계열 (고구마 컨셉)

## 주요 기능

- 상품 목록 (메인 페이지)
- 상품 등록/상세/수정/삭제
- 소셜 로그인 (카카오/구글)
- 결제 (토스페이먼츠)

## 데이터베이스

테이블: `profiles`, `products`, `likes`, `chat_rooms`, `messages`

- `products.status`: `'판매중' | '예약중' | '판매완료'`
- 회원가입 시 `profiles` 자동 생성 (트리거)
- 찜 추가/삭제 시 `products.like_count` 자동 동기화 (트리거)
- Storage 버킷: `product-images` (public)
- 전체 스키마: `supabase/schema.sql` 참고

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```
