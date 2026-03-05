--
-- PostgreSQL database dump
--

\restrict DvL2XCnDk0dCKGtAZxEbQHDrg9f6cCL3GJeWWTaC0F58nDffiDWNEudbjgh6Y5B

-- Dumped from database version 15.16 (Debian 15.16-0+deb12u1)
-- Dumped by pg_dump version 15.16 (Debian 15.16-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "users_openId_unique";
ALTER TABLE IF EXISTS ONLY public."systemBackups" DROP CONSTRAINT IF EXISTS "systemBackups_pkey";
ALTER TABLE IF EXISTS ONLY public."subAdmins" DROP CONSTRAINT IF EXISTS "subAdmins_username_unique";
ALTER TABLE IF EXISTS ONLY public."subAdmins" DROP CONSTRAINT IF EXISTS "subAdmins_pkey";
ALTER TABLE IF EXISTS ONLY public."strategyAnalysis" DROP CONSTRAINT IF EXISTS "strategyAnalysis_pkey";
ALTER TABLE IF EXISTS ONLY public."screenshotUploads" DROP CONSTRAINT IF EXISTS "screenshotUploads_pkey";
ALTER TABLE IF EXISTS ONLY public.schedules DROP CONSTRAINT IF EXISTS schedules_pkey;
ALTER TABLE IF EXISTS ONLY public."scheduleEntries" DROP CONSTRAINT IF EXISTS "scheduleEntries_pkey";
ALTER TABLE IF EXISTS ONLY public."reliquiasSeasons" DROP CONSTRAINT IF EXISTS "reliquiasSeasons_pkey";
ALTER TABLE IF EXISTS ONLY public."reliquiasMemberRoles" DROP CONSTRAINT IF EXISTS "reliquiasMemberRoles_pkey";
ALTER TABLE IF EXISTS ONLY public."reliquiasMemberAssignments" DROP CONSTRAINT IF EXISTS "reliquiasMemberAssignments_pkey";
ALTER TABLE IF EXISTS ONLY public."reliquiasDamage" DROP CONSTRAINT IF EXISTS "reliquiasDamage_pkey";
ALTER TABLE IF EXISTS ONLY public."reliquiasBossProgress" DROP CONSTRAINT IF EXISTS "reliquiasBossProgress_pkey";
ALTER TABLE IF EXISTS ONLY public."performanceRecords" DROP CONSTRAINT IF EXISTS "performanceRecords_pkey";
ALTER TABLE IF EXISTS ONLY public."nonAttackerAlerts" DROP CONSTRAINT IF EXISTS "nonAttackerAlerts_pkey";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_pkey;
ALTER TABLE IF EXISTS ONLY public."gvgStrategyBackups" DROP CONSTRAINT IF EXISTS "gvgStrategyBackups_pkey";
ALTER TABLE IF EXISTS ONLY public."gvgStrategies" DROP CONSTRAINT IF EXISTS "gvgStrategies_pkey";
ALTER TABLE IF EXISTS ONLY public."gvgSeasons" DROP CONSTRAINT IF EXISTS "gvgSeasons_pkey";
ALTER TABLE IF EXISTS ONLY public."gvgMatchInfo" DROP CONSTRAINT IF EXISTS "gvgMatchInfo_pkey";
ALTER TABLE IF EXISTS ONLY public."gvgMatchInfo" DROP CONSTRAINT IF EXISTS "gvgMatchInfo_eventDate_unique";
ALTER TABLE IF EXISTS ONLY public."gvgAttacks" DROP CONSTRAINT IF EXISTS "gvgAttacks_pkey";
ALTER TABLE IF EXISTS ONLY public."gotStrategyBackups" DROP CONSTRAINT IF EXISTS "gotStrategyBackups_pkey";
ALTER TABLE IF EXISTS ONLY public."gotStrategies" DROP CONSTRAINT IF EXISTS "gotStrategies_pkey";
ALTER TABLE IF EXISTS ONLY public."gotAttacks" DROP CONSTRAINT IF EXISTS "gotAttacks_pkey";
ALTER TABLE IF EXISTS ONLY public."eventTypes" DROP CONSTRAINT IF EXISTS "eventTypes_pkey";
ALTER TABLE IF EXISTS ONLY public."eventTypes" DROP CONSTRAINT IF EXISTS "eventTypes_name_unique";
ALTER TABLE IF EXISTS ONLY public.characters DROP CONSTRAINT IF EXISTS characters_pkey;
ALTER TABLE IF EXISTS ONLY public."characterSkills" DROP CONSTRAINT IF EXISTS "characterSkills_pkey";
ALTER TABLE IF EXISTS ONLY public."characterLinks" DROP CONSTRAINT IF EXISTS "characterLinks_pkey";
ALTER TABLE IF EXISTS ONLY public."characterConstellations" DROP CONSTRAINT IF EXISTS "characterConstellations_pkey";
ALTER TABLE IF EXISTS ONLY public."characterCloth" DROP CONSTRAINT IF EXISTS "characterCloth_pkey";
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_pkey;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_name_unique;
ALTER TABLE IF EXISTS ONLY public."cardBackups" DROP CONSTRAINT IF EXISTS "cardBackups_pkey";
ALTER TABLE IF EXISTS ONLY public."botConfig" DROP CONSTRAINT IF EXISTS "botConfig_pkey";
ALTER TABLE IF EXISTS ONLY public.arayashiki_synergies DROP CONSTRAINT IF EXISTS arayashiki_synergies_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public."announcementRecipients" DROP CONSTRAINT IF EXISTS "announcementRecipients_pkey";
ALTER TABLE IF EXISTS ONLY public."aiChatSessions" DROP CONSTRAINT IF EXISTS "aiChatSessions_pkey";
ALTER TABLE IF EXISTS ONLY public."aiChatHistory" DROP CONSTRAINT IF EXISTS "aiChatHistory_pkey";
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."systemBackups" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."subAdmins" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."strategyAnalysis" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."screenshotUploads" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.schedules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."scheduleEntries" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."reliquiasSeasons" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."reliquiasMemberRoles" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."reliquiasMemberAssignments" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."reliquiasDamage" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."reliquiasBossProgress" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."performanceRecords" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."nonAttackerAlerts" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.members ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gvgStrategyBackups" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gvgStrategies" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gvgSeasons" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gvgMatchInfo" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gvgAttacks" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gotStrategyBackups" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gotStrategies" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."gotAttacks" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."eventTypes" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.characters ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."characterSkills" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."characterLinks" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."characterConstellations" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."characterCloth" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cards ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."cardBackups" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."botConfig" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.arayashiki_synergies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."announcementRecipients" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."aiChatSessions" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."aiChatHistory" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public."systemBackups_id_seq";
DROP TABLE IF EXISTS public."systemBackups";
DROP SEQUENCE IF EXISTS public."subAdmins_id_seq";
DROP TABLE IF EXISTS public."subAdmins";
DROP SEQUENCE IF EXISTS public."strategyAnalysis_id_seq";
DROP TABLE IF EXISTS public."strategyAnalysis";
DROP SEQUENCE IF EXISTS public."screenshotUploads_id_seq";
DROP TABLE IF EXISTS public."screenshotUploads";
DROP SEQUENCE IF EXISTS public.schedules_id_seq;
DROP TABLE IF EXISTS public.schedules;
DROP SEQUENCE IF EXISTS public."scheduleEntries_id_seq";
DROP TABLE IF EXISTS public."scheduleEntries";
DROP SEQUENCE IF EXISTS public."reliquiasSeasons_id_seq";
DROP TABLE IF EXISTS public."reliquiasSeasons";
DROP SEQUENCE IF EXISTS public."reliquiasMemberRoles_id_seq";
DROP TABLE IF EXISTS public."reliquiasMemberRoles";
DROP SEQUENCE IF EXISTS public."reliquiasMemberAssignments_id_seq";
DROP TABLE IF EXISTS public."reliquiasMemberAssignments";
DROP SEQUENCE IF EXISTS public."reliquiasDamage_id_seq";
DROP TABLE IF EXISTS public."reliquiasDamage";
DROP SEQUENCE IF EXISTS public."reliquiasBossProgress_id_seq";
DROP TABLE IF EXISTS public."reliquiasBossProgress";
DROP SEQUENCE IF EXISTS public."performanceRecords_id_seq";
DROP TABLE IF EXISTS public."performanceRecords";
DROP SEQUENCE IF EXISTS public."nonAttackerAlerts_id_seq";
DROP TABLE IF EXISTS public."nonAttackerAlerts";
DROP SEQUENCE IF EXISTS public.members_id_seq;
DROP TABLE IF EXISTS public.members;
DROP SEQUENCE IF EXISTS public."gvgStrategyBackups_id_seq";
DROP TABLE IF EXISTS public."gvgStrategyBackups";
DROP SEQUENCE IF EXISTS public."gvgStrategies_id_seq";
DROP TABLE IF EXISTS public."gvgStrategies";
DROP SEQUENCE IF EXISTS public."gvgSeasons_id_seq";
DROP TABLE IF EXISTS public."gvgSeasons";
DROP SEQUENCE IF EXISTS public."gvgMatchInfo_id_seq";
DROP TABLE IF EXISTS public."gvgMatchInfo";
DROP SEQUENCE IF EXISTS public."gvgAttacks_id_seq";
DROP TABLE IF EXISTS public."gvgAttacks";
DROP SEQUENCE IF EXISTS public."gotStrategyBackups_id_seq";
DROP TABLE IF EXISTS public."gotStrategyBackups";
DROP SEQUENCE IF EXISTS public."gotStrategies_id_seq";
DROP TABLE IF EXISTS public."gotStrategies";
DROP SEQUENCE IF EXISTS public."gotAttacks_id_seq";
DROP TABLE IF EXISTS public."gotAttacks";
DROP SEQUENCE IF EXISTS public."eventTypes_id_seq";
DROP TABLE IF EXISTS public."eventTypes";
DROP SEQUENCE IF EXISTS public.characters_id_seq;
DROP TABLE IF EXISTS public.characters;
DROP SEQUENCE IF EXISTS public."characterSkills_id_seq";
DROP TABLE IF EXISTS public."characterSkills";
DROP SEQUENCE IF EXISTS public."characterLinks_id_seq";
DROP TABLE IF EXISTS public."characterLinks";
DROP SEQUENCE IF EXISTS public."characterConstellations_id_seq";
DROP TABLE IF EXISTS public."characterConstellations";
DROP SEQUENCE IF EXISTS public."characterCloth_id_seq";
DROP TABLE IF EXISTS public."characterCloth";
DROP SEQUENCE IF EXISTS public.cards_id_seq;
DROP TABLE IF EXISTS public.cards;
DROP SEQUENCE IF EXISTS public."cardBackups_id_seq";
DROP TABLE IF EXISTS public."cardBackups";
DROP SEQUENCE IF EXISTS public."botConfig_id_seq";
DROP TABLE IF EXISTS public."botConfig";
DROP SEQUENCE IF EXISTS public.arayashiki_synergies_id_seq;
DROP TABLE IF EXISTS public.arayashiki_synergies;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
DROP SEQUENCE IF EXISTS public."announcementRecipients_id_seq";
DROP TABLE IF EXISTS public."announcementRecipients";
DROP SEQUENCE IF EXISTS public."aiChatSessions_id_seq";
DROP TABLE IF EXISTS public."aiChatSessions";
DROP SEQUENCE IF EXISTS public."aiChatHistory_id_seq";
DROP TABLE IF EXISTS public."aiChatHistory";
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.member_role;
DROP TYPE IF EXISTS public.gvg_season_status;
DROP TYPE IF EXISTS public.chat_role;
DROP TYPE IF EXISTS public.backup_type;
DROP SCHEMA IF EXISTS drizzle;
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: sapuri
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO sapuri;

--
-- Name: backup_type; Type: TYPE; Schema: public; Owner: sapuri
--

CREATE TYPE public.backup_type AS ENUM (
    'create',
    'update',
    'delete',
    'manual',
    'auto'
);


ALTER TYPE public.backup_type OWNER TO sapuri;

--
-- Name: chat_role; Type: TYPE; Schema: public; Owner: sapuri
--

CREATE TYPE public.chat_role AS ENUM (
    'user',
    'assistant'
);


ALTER TYPE public.chat_role OWNER TO sapuri;

--
-- Name: gvg_season_status; Type: TYPE; Schema: public; Owner: sapuri
--

CREATE TYPE public.gvg_season_status AS ENUM (
    'active',
    'paused',
    'ended'
);


ALTER TYPE public.gvg_season_status OWNER TO sapuri;

--
-- Name: member_role; Type: TYPE; Schema: public; Owner: sapuri
--

CREATE TYPE public.member_role AS ENUM (
    'guards',
    'boss'
);


ALTER TYPE public.member_role OWNER TO sapuri;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: sapuri
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin',
    'subadmin'
);


ALTER TYPE public.user_role OWNER TO sapuri;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: sapuri
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO sapuri;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: sapuri
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO sapuri;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: sapuri
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: aiChatHistory; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."aiChatHistory" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    role public.chat_role NOT NULL,
    message text NOT NULL,
    context character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."aiChatHistory" OWNER TO sapuri;

--
-- Name: aiChatHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."aiChatHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."aiChatHistory_id_seq" OWNER TO sapuri;

--
-- Name: aiChatHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."aiChatHistory_id_seq" OWNED BY public."aiChatHistory".id;


--
-- Name: aiChatSessions; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."aiChatSessions" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title character varying(255),
    context character varying(100),
    "messageCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."aiChatSessions" OWNER TO sapuri;

--
-- Name: aiChatSessions_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."aiChatSessions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."aiChatSessions_id_seq" OWNER TO sapuri;

--
-- Name: aiChatSessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."aiChatSessions_id_seq" OWNED BY public."aiChatSessions".id;


--
-- Name: announcementRecipients; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."announcementRecipients" (
    id integer NOT NULL,
    "announcementId" integer NOT NULL,
    "memberId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."announcementRecipients" OWNER TO sapuri;

--
-- Name: announcementRecipients_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."announcementRecipients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."announcementRecipients_id_seq" OWNER TO sapuri;

--
-- Name: announcementRecipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."announcementRecipients_id_seq" OWNED BY public."announcementRecipients".id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    "eventTypeId" integer,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    "createdBy" integer NOT NULL,
    "sentAt" timestamp without time zone,
    "isGeneral" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.announcements OWNER TO sapuri;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.announcements_id_seq OWNER TO sapuri;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: arayashiki_synergies; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.arayashiki_synergies (
    id integer NOT NULL,
    character1 character varying(100) NOT NULL,
    character2 character varying(100) NOT NULL,
    "synergyType" character varying(50),
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.arayashiki_synergies OWNER TO sapuri;

--
-- Name: arayashiki_synergies_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.arayashiki_synergies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.arayashiki_synergies_id_seq OWNER TO sapuri;

--
-- Name: arayashiki_synergies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.arayashiki_synergies_id_seq OWNED BY public.arayashiki_synergies.id;


--
-- Name: botConfig; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."botConfig" (
    id integer NOT NULL,
    "telegramBotToken" character varying(255),
    "telegramGroupId" character varying(100),
    "isActive" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."botConfig" OWNER TO sapuri;

--
-- Name: botConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."botConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."botConfig_id_seq" OWNER TO sapuri;

--
-- Name: botConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."botConfig_id_seq" OWNED BY public."botConfig".id;


--
-- Name: cardBackups; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."cardBackups" (
    id integer NOT NULL,
    "cardId" integer NOT NULL,
    "backupType" public.backup_type NOT NULL,
    "cardData" text NOT NULL,
    "backupReason" character varying(255),
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."cardBackups" OWNER TO sapuri;

--
-- Name: cardBackups_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."cardBackups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."cardBackups_id_seq" OWNER TO sapuri;

--
-- Name: cardBackups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."cardBackups_id_seq" OWNED BY public."cardBackups".id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "imageUrl" character varying(500),
    "referenceLink" character varying(500),
    "usageLimit" character varying(255) NOT NULL,
    "bonusDmg" character varying(10) DEFAULT '0'::character varying,
    "bonusDef" character varying(10) DEFAULT '0'::character varying,
    "bonusVid" character varying(10) DEFAULT '0'::character varying,
    "bonusPress" character varying(10) DEFAULT '0'::character varying,
    "bonusEsquiva" character varying(10) DEFAULT '0'::character varying,
    "bonusVelAtaq" character varying(10) DEFAULT '0'::character varying,
    "bonusTenacidade" character varying(10) DEFAULT '0'::character varying,
    "bonusSanguessuga" character varying(10) DEFAULT '0'::character varying,
    "bonusRedDano" character varying(10) DEFAULT '0'::character varying,
    "bonusCrit" character varying(10) DEFAULT '0'::character varying,
    "bonusCura" character varying(10) DEFAULT '0'::character varying,
    "bonusCuraRecebida" character varying(10) DEFAULT '0'::character varying,
    "bonusPrecisao" character varying(10) DEFAULT '0'::character varying,
    "bonusVida" character varying(10) DEFAULT '0'::character varying,
    "skillEffect" text,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cards OWNER TO sapuri;

--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cards_id_seq OWNER TO sapuri;

--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: characterCloth; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."characterCloth" (
    id integer NOT NULL,
    character_id integer NOT NULL,
    level integer,
    description text,
    hp_boost numeric(5,2),
    atk_boost numeric(5,2),
    def_boost numeric(5,2),
    haste integer
);


ALTER TABLE public."characterCloth" OWNER TO sapuri;

--
-- Name: characterCloth_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."characterCloth_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."characterCloth_id_seq" OWNER TO sapuri;

--
-- Name: characterCloth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."characterCloth_id_seq" OWNED BY public."characterCloth".id;


--
-- Name: characterConstellations; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."characterConstellations" (
    id integer NOT NULL,
    character_id integer NOT NULL,
    constellation_name character varying(100),
    description text,
    level character varying(10),
    hp_boost numeric(5,2),
    dodge integer,
    atk_boost numeric(5,2),
    crit numeric(5,2),
    def_boost numeric(5,2),
    hit integer
);


ALTER TABLE public."characterConstellations" OWNER TO sapuri;

--
-- Name: characterConstellations_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."characterConstellations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."characterConstellations_id_seq" OWNER TO sapuri;

--
-- Name: characterConstellations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."characterConstellations_id_seq" OWNED BY public."characterConstellations".id;


--
-- Name: characterLinks; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."characterLinks" (
    id integer NOT NULL,
    character_id integer NOT NULL,
    link_name character varying(100),
    description text,
    level integer
);


ALTER TABLE public."characterLinks" OWNER TO sapuri;

--
-- Name: characterLinks_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."characterLinks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."characterLinks_id_seq" OWNER TO sapuri;

--
-- Name: characterLinks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."characterLinks_id_seq" OWNED BY public."characterLinks".id;


--
-- Name: characterSkills; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."characterSkills" (
    id integer NOT NULL,
    character_id integer NOT NULL,
    skill_name character varying(100),
    skill_type character varying(50),
    description text,
    start_time numeric(5,3),
    end_time numeric(5,3),
    delay numeric(5,2),
    cooldown numeric(5,2),
    cosmos_gain_atk integer,
    cosmos_gain_dmg integer
);


ALTER TABLE public."characterSkills" OWNER TO sapuri;

--
-- Name: characterSkills_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."characterSkills_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."characterSkills_id_seq" OWNER TO sapuri;

--
-- Name: characterSkills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."characterSkills_id_seq" OWNED BY public."characterSkills".id;


--
-- Name: characters; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.characters (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    class character varying(50),
    type character varying(50),
    summon_type character varying(50),
    release_date character varying(10),
    stars integer,
    level integer,
    hp integer,
    atk integer,
    def integer,
    attack_rate numeric(5,2),
    tenacity numeric(5,2),
    cosmos_gain_atk integer,
    cosmos_gain_dmg integer,
    dano_percent numeric(5,2),
    defesa_percent numeric(5,2),
    resistencia numeric(5,2),
    pressa numeric(5,2),
    esquiva_percent numeric(5,2),
    vel_ataque_percent numeric(5,2),
    tenacidade numeric(5,2),
    sanguessuga numeric(5,2),
    dano_vermelho_percent numeric(5,2),
    tax_critico numeric(5,2),
    precisao numeric(5,2),
    cura_percent numeric(5,2),
    cura_recebida_percent numeric(5,2),
    bonus_vida_percent numeric(5,2),
    red_dano_percent numeric(5,2),
    esquiva_valor numeric(5,2),
    efeito_habilidade text,
    image_url character varying(500),
    ssloj_url character varying(500),
    last_updated timestamp without time zone DEFAULT now()
);


ALTER TABLE public.characters OWNER TO sapuri;

--
-- Name: characters_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.characters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.characters_id_seq OWNER TO sapuri;

--
-- Name: characters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.characters_id_seq OWNED BY public.characters.id;


--
-- Name: eventTypes; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."eventTypes" (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    "displayName" character varying(100) NOT NULL,
    "maxPlayers" integer NOT NULL,
    "eventTime" character varying(5) NOT NULL,
    "reminderMinutes" integer DEFAULT 30 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."eventTypes" OWNER TO sapuri;

--
-- Name: eventTypes_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."eventTypes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."eventTypes_id_seq" OWNER TO sapuri;

--
-- Name: eventTypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."eventTypes_id_seq" OWNED BY public."eventTypes".id;


--
-- Name: gotAttacks; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gotAttacks" (
    id integer NOT NULL,
    "scheduleId" integer NOT NULL,
    "memberId" integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "attackVictories" integer DEFAULT 0 NOT NULL,
    "attackDefeats" integer DEFAULT 0 NOT NULL,
    "defenseVictories" integer DEFAULT 0 NOT NULL,
    "defenseDefeats" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "previousPoints" integer DEFAULT 0 NOT NULL,
    "pointsDifference" integer DEFAULT 0 NOT NULL,
    ranking integer,
    "didNotAttack" boolean DEFAULT false NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gotAttacks" OWNER TO sapuri;

--
-- Name: gotAttacks_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gotAttacks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gotAttacks_id_seq" OWNER TO sapuri;

--
-- Name: gotAttacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gotAttacks_id_seq" OWNED BY public."gotAttacks".id;


--
-- Name: gotStrategies; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gotStrategies" (
    id integer NOT NULL,
    name character varying(100),
    observation text,
    "attackFormation1" character varying(50) NOT NULL,
    "attackFormation2" character varying(50) NOT NULL,
    "attackFormation3" character varying(50) NOT NULL,
    "defenseFormation1" character varying(50) NOT NULL,
    "defenseFormation2" character varying(50) NOT NULL,
    "defenseFormation3" character varying(50) NOT NULL,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gotStrategies" OWNER TO sapuri;

--
-- Name: gotStrategies_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gotStrategies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gotStrategies_id_seq" OWNER TO sapuri;

--
-- Name: gotStrategies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gotStrategies_id_seq" OWNED BY public."gotStrategies".id;


--
-- Name: gotStrategyBackups; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gotStrategyBackups" (
    id integer NOT NULL,
    "strategyId" integer NOT NULL,
    "backupType" public.backup_type NOT NULL,
    "strategyData" text NOT NULL,
    "backupReason" character varying(255),
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gotStrategyBackups" OWNER TO sapuri;

--
-- Name: gotStrategyBackups_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gotStrategyBackups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gotStrategyBackups_id_seq" OWNER TO sapuri;

--
-- Name: gotStrategyBackups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gotStrategyBackups_id_seq" OWNED BY public."gotStrategyBackups".id;


--
-- Name: gvgAttacks; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gvgAttacks" (
    id integer NOT NULL,
    "scheduleId" integer NOT NULL,
    "memberId" integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "attack1Stars" integer DEFAULT 0 NOT NULL,
    "attack1Missed" boolean DEFAULT false NOT NULL,
    "attack1Opponent" character varying(100),
    "attack2Stars" integer DEFAULT 0 NOT NULL,
    "attack2Missed" boolean DEFAULT false NOT NULL,
    "attack2Opponent" character varying(100),
    "didNotAttack" boolean DEFAULT false NOT NULL,
    "previousValidStars" integer DEFAULT 0 NOT NULL,
    "currentValidStars" integer DEFAULT 0 NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gvgAttacks" OWNER TO sapuri;

--
-- Name: gvgAttacks_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gvgAttacks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gvgAttacks_id_seq" OWNER TO sapuri;

--
-- Name: gvgAttacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gvgAttacks_id_seq" OWNED BY public."gvgAttacks".id;


--
-- Name: gvgMatchInfo; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gvgMatchInfo" (
    id integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "opponentGuild" character varying(100),
    "ourScore" integer DEFAULT 0 NOT NULL,
    "opponentScore" integer DEFAULT 0 NOT NULL,
    "validStars" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gvgMatchInfo" OWNER TO sapuri;

--
-- Name: gvgMatchInfo_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gvgMatchInfo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gvgMatchInfo_id_seq" OWNER TO sapuri;

--
-- Name: gvgMatchInfo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gvgMatchInfo_id_seq" OWNED BY public."gvgMatchInfo".id;


--
-- Name: gvgSeasons; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gvgSeasons" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    status public.gvg_season_status DEFAULT 'active'::public.gvg_season_status NOT NULL,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone NOT NULL,
    "returnDate" timestamp without time zone,
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gvgSeasons" OWNER TO sapuri;

--
-- Name: gvgSeasons_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gvgSeasons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gvgSeasons_id_seq" OWNER TO sapuri;

--
-- Name: gvgSeasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gvgSeasons_id_seq" OWNED BY public."gvgSeasons".id;


--
-- Name: gvgStrategies; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gvgStrategies" (
    id integer NOT NULL,
    name character varying(100),
    "attackFormation1" character varying(50) NOT NULL,
    "attackFormation2" character varying(50) NOT NULL,
    "attackFormation3" character varying(50) NOT NULL,
    "attackFormation4" character varying(50) NOT NULL,
    "attackFormation5" character varying(50) NOT NULL,
    "defenseFormation1" character varying(50) NOT NULL,
    "defenseFormation2" character varying(50) NOT NULL,
    "defenseFormation3" character varying(50) NOT NULL,
    "defenseFormation4" character varying(50) NOT NULL,
    "defenseFormation5" character varying(50) NOT NULL,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gvgStrategies" OWNER TO sapuri;

--
-- Name: gvgStrategies_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gvgStrategies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gvgStrategies_id_seq" OWNER TO sapuri;

--
-- Name: gvgStrategies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gvgStrategies_id_seq" OWNED BY public."gvgStrategies".id;


--
-- Name: gvgStrategyBackups; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."gvgStrategyBackups" (
    id integer NOT NULL,
    "strategyId" integer NOT NULL,
    "backupType" public.backup_type NOT NULL,
    "strategyData" text NOT NULL,
    "backupReason" character varying(255),
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."gvgStrategyBackups" OWNER TO sapuri;

--
-- Name: gvgStrategyBackups_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."gvgStrategyBackups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."gvgStrategyBackups_id_seq" OWNER TO sapuri;

--
-- Name: gvgStrategyBackups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."gvgStrategyBackups_id_seq" OWNED BY public."gvgStrategyBackups".id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.members (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "telegramId" character varying(100),
    "telegramUsername" character varying(100),
    "telegramChatId" character varying(100),
    "phoneNumber" character varying(20),
    "participatesGvg" boolean DEFAULT true NOT NULL,
    "participatesGot" boolean DEFAULT true NOT NULL,
    "participatesReliquias" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.members OWNER TO sapuri;

--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.members_id_seq OWNER TO sapuri;

--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: nonAttackerAlerts; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."nonAttackerAlerts" (
    id integer NOT NULL,
    "eventTypeId" integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "memberId" integer NOT NULL,
    "alertSent" boolean DEFAULT false NOT NULL,
    "adminNotified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."nonAttackerAlerts" OWNER TO sapuri;

--
-- Name: nonAttackerAlerts_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."nonAttackerAlerts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."nonAttackerAlerts_id_seq" OWNER TO sapuri;

--
-- Name: nonAttackerAlerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."nonAttackerAlerts_id_seq" OWNED BY public."nonAttackerAlerts".id;


--
-- Name: performanceRecords; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."performanceRecords" (
    id integer NOT NULL,
    "eventTypeId" integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "memberId" integer NOT NULL,
    attacked boolean DEFAULT false NOT NULL,
    notes text,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."performanceRecords" OWNER TO sapuri;

--
-- Name: performanceRecords_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."performanceRecords_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."performanceRecords_id_seq" OWNER TO sapuri;

--
-- Name: performanceRecords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."performanceRecords_id_seq" OWNED BY public."performanceRecords".id;


--
-- Name: reliquiasBossProgress; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."reliquiasBossProgress" (
    id integer NOT NULL,
    "seasonId" integer NOT NULL,
    "bossId" integer NOT NULL,
    "bossName" character varying(50) NOT NULL,
    "currentHp" integer DEFAULT 100 NOT NULL,
    "maxHp" integer DEFAULT 100 NOT NULL,
    stage integer DEFAULT 1 NOT NULL,
    "isDefeated" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."reliquiasBossProgress" OWNER TO sapuri;

--
-- Name: reliquiasBossProgress_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."reliquiasBossProgress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."reliquiasBossProgress_id_seq" OWNER TO sapuri;

--
-- Name: reliquiasBossProgress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."reliquiasBossProgress_id_seq" OWNED BY public."reliquiasBossProgress".id;


--
-- Name: reliquiasDamage; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."reliquiasDamage" (
    id integer NOT NULL,
    "seasonId" integer NOT NULL,
    "memberId" integer NOT NULL,
    "cumulativeDamage" character varying(50) NOT NULL,
    "damageNumeric" integer DEFAULT 0 NOT NULL,
    ranking integer,
    power character varying(20),
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."reliquiasDamage" OWNER TO sapuri;

--
-- Name: reliquiasDamage_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."reliquiasDamage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."reliquiasDamage_id_seq" OWNER TO sapuri;

--
-- Name: reliquiasDamage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."reliquiasDamage_id_seq" OWNED BY public."reliquiasDamage".id;


--
-- Name: reliquiasMemberAssignments; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."reliquiasMemberAssignments" (
    id integer NOT NULL,
    "memberId" integer NOT NULL,
    "bossName" character varying(50) NOT NULL,
    "seasonId" integer NOT NULL,
    "bossId" integer NOT NULL,
    "assignedAt" character varying(50),
    "unassignedAt" character varying(50),
    "createdAt" character varying(20) NOT NULL,
    "updatedAt" character varying(20) NOT NULL,
    "attackNumber" integer DEFAULT 1,
    role public.member_role DEFAULT 'guards'::public.member_role,
    "guard1Number" integer,
    "guard2Number" integer,
    performance text
);


ALTER TABLE public."reliquiasMemberAssignments" OWNER TO sapuri;

--
-- Name: reliquiasMemberAssignments_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."reliquiasMemberAssignments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."reliquiasMemberAssignments_id_seq" OWNER TO sapuri;

--
-- Name: reliquiasMemberAssignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."reliquiasMemberAssignments_id_seq" OWNED BY public."reliquiasMemberAssignments".id;


--
-- Name: reliquiasMemberRoles; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."reliquiasMemberRoles" (
    id integer NOT NULL,
    "seasonId" integer NOT NULL,
    "memberId" integer NOT NULL,
    role public.member_role DEFAULT 'guards'::public.member_role NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."reliquiasMemberRoles" OWNER TO sapuri;

--
-- Name: reliquiasMemberRoles_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."reliquiasMemberRoles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."reliquiasMemberRoles_id_seq" OWNER TO sapuri;

--
-- Name: reliquiasMemberRoles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."reliquiasMemberRoles_id_seq" OWNED BY public."reliquiasMemberRoles".id;


--
-- Name: reliquiasSeasons; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."reliquiasSeasons" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "startDate" character varying(50) NOT NULL,
    "endDate" character varying(50),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."reliquiasSeasons" OWNER TO sapuri;

--
-- Name: reliquiasSeasons_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."reliquiasSeasons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."reliquiasSeasons_id_seq" OWNER TO sapuri;

--
-- Name: reliquiasSeasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."reliquiasSeasons_id_seq" OWNED BY public."reliquiasSeasons".id;


--
-- Name: scheduleEntries; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."scheduleEntries" (
    id integer NOT NULL,
    "scheduleId" integer NOT NULL,
    "memberId" integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."scheduleEntries" OWNER TO sapuri;

--
-- Name: scheduleEntries_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."scheduleEntries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."scheduleEntries_id_seq" OWNER TO sapuri;

--
-- Name: scheduleEntries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."scheduleEntries_id_seq" OWNED BY public."scheduleEntries".id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.schedules (
    id integer NOT NULL,
    "eventTypeId" integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "createdBy" integer NOT NULL,
    "notificationSent" boolean DEFAULT false NOT NULL,
    "reminderSent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schedules OWNER TO sapuri;

--
-- Name: schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schedules_id_seq OWNER TO sapuri;

--
-- Name: schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.schedules_id_seq OWNED BY public.schedules.id;


--
-- Name: screenshotUploads; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."screenshotUploads" (
    id integer NOT NULL,
    "eventTypeId" integer NOT NULL,
    "eventDate" character varying(10) NOT NULL,
    "imageUrl" character varying(500) NOT NULL,
    "imageKey" character varying(255) NOT NULL,
    "extractedData" text,
    processed boolean DEFAULT false NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."screenshotUploads" OWNER TO sapuri;

--
-- Name: screenshotUploads_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."screenshotUploads_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."screenshotUploads_id_seq" OWNER TO sapuri;

--
-- Name: screenshotUploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."screenshotUploads_id_seq" OWNED BY public."screenshotUploads".id;


--
-- Name: strategyAnalysis; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."strategyAnalysis" (
    id integer NOT NULL,
    "strategyId" integer NOT NULL,
    analysis text NOT NULL,
    suggestions text,
    strengths text,
    weaknesses text,
    rating numeric(3,2),
    "analyzedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."strategyAnalysis" OWNER TO sapuri;

--
-- Name: strategyAnalysis_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."strategyAnalysis_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."strategyAnalysis_id_seq" OWNER TO sapuri;

--
-- Name: strategyAnalysis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."strategyAnalysis_id_seq" OWNED BY public."strategyAnalysis".id;


--
-- Name: subAdmins; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."subAdmins" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    "canManageGvg" boolean DEFAULT false NOT NULL,
    "canManageGot" boolean DEFAULT false NOT NULL,
    "canManageReliquias" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."subAdmins" OWNER TO sapuri;

--
-- Name: subAdmins_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."subAdmins_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."subAdmins_id_seq" OWNER TO sapuri;

--
-- Name: subAdmins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."subAdmins_id_seq" OWNED BY public."subAdmins".id;


--
-- Name: systemBackups; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public."systemBackups" (
    id integer NOT NULL,
    "backupName" character varying(255) NOT NULL,
    description text,
    "backupData" text NOT NULL,
    "backupSize" integer NOT NULL,
    "backupType" public.backup_type DEFAULT 'manual'::public.backup_type NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."systemBackups" OWNER TO sapuri;

--
-- Name: systemBackups_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public."systemBackups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."systemBackups_id_seq" OWNER TO sapuri;

--
-- Name: systemBackups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public."systemBackups_id_seq" OWNED BY public."systemBackups".id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sapuri
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "openId" character varying(64) NOT NULL,
    name text,
    email character varying(320),
    "loginMethod" character varying(64),
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastSignedIn" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO sapuri;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sapuri
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO sapuri;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sapuri
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: sapuri
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: aiChatHistory id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."aiChatHistory" ALTER COLUMN id SET DEFAULT nextval('public."aiChatHistory_id_seq"'::regclass);


--
-- Name: aiChatSessions id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."aiChatSessions" ALTER COLUMN id SET DEFAULT nextval('public."aiChatSessions_id_seq"'::regclass);


--
-- Name: announcementRecipients id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."announcementRecipients" ALTER COLUMN id SET DEFAULT nextval('public."announcementRecipients_id_seq"'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: arayashiki_synergies id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.arayashiki_synergies ALTER COLUMN id SET DEFAULT nextval('public.arayashiki_synergies_id_seq'::regclass);


--
-- Name: botConfig id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."botConfig" ALTER COLUMN id SET DEFAULT nextval('public."botConfig_id_seq"'::regclass);


--
-- Name: cardBackups id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."cardBackups" ALTER COLUMN id SET DEFAULT nextval('public."cardBackups_id_seq"'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: characterCloth id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterCloth" ALTER COLUMN id SET DEFAULT nextval('public."characterCloth_id_seq"'::regclass);


--
-- Name: characterConstellations id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterConstellations" ALTER COLUMN id SET DEFAULT nextval('public."characterConstellations_id_seq"'::regclass);


--
-- Name: characterLinks id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterLinks" ALTER COLUMN id SET DEFAULT nextval('public."characterLinks_id_seq"'::regclass);


--
-- Name: characterSkills id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterSkills" ALTER COLUMN id SET DEFAULT nextval('public."characterSkills_id_seq"'::regclass);


--
-- Name: characters id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.characters ALTER COLUMN id SET DEFAULT nextval('public.characters_id_seq'::regclass);


--
-- Name: eventTypes id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."eventTypes" ALTER COLUMN id SET DEFAULT nextval('public."eventTypes_id_seq"'::regclass);


--
-- Name: gotAttacks id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gotAttacks" ALTER COLUMN id SET DEFAULT nextval('public."gotAttacks_id_seq"'::regclass);


--
-- Name: gotStrategies id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gotStrategies" ALTER COLUMN id SET DEFAULT nextval('public."gotStrategies_id_seq"'::regclass);


--
-- Name: gotStrategyBackups id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gotStrategyBackups" ALTER COLUMN id SET DEFAULT nextval('public."gotStrategyBackups_id_seq"'::regclass);


--
-- Name: gvgAttacks id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgAttacks" ALTER COLUMN id SET DEFAULT nextval('public."gvgAttacks_id_seq"'::regclass);


--
-- Name: gvgMatchInfo id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgMatchInfo" ALTER COLUMN id SET DEFAULT nextval('public."gvgMatchInfo_id_seq"'::regclass);


--
-- Name: gvgSeasons id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgSeasons" ALTER COLUMN id SET DEFAULT nextval('public."gvgSeasons_id_seq"'::regclass);


--
-- Name: gvgStrategies id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgStrategies" ALTER COLUMN id SET DEFAULT nextval('public."gvgStrategies_id_seq"'::regclass);


--
-- Name: gvgStrategyBackups id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgStrategyBackups" ALTER COLUMN id SET DEFAULT nextval('public."gvgStrategyBackups_id_seq"'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: nonAttackerAlerts id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."nonAttackerAlerts" ALTER COLUMN id SET DEFAULT nextval('public."nonAttackerAlerts_id_seq"'::regclass);


--
-- Name: performanceRecords id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."performanceRecords" ALTER COLUMN id SET DEFAULT nextval('public."performanceRecords_id_seq"'::regclass);


--
-- Name: reliquiasBossProgress id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasBossProgress" ALTER COLUMN id SET DEFAULT nextval('public."reliquiasBossProgress_id_seq"'::regclass);


--
-- Name: reliquiasDamage id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasDamage" ALTER COLUMN id SET DEFAULT nextval('public."reliquiasDamage_id_seq"'::regclass);


--
-- Name: reliquiasMemberAssignments id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasMemberAssignments" ALTER COLUMN id SET DEFAULT nextval('public."reliquiasMemberAssignments_id_seq"'::regclass);


--
-- Name: reliquiasMemberRoles id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasMemberRoles" ALTER COLUMN id SET DEFAULT nextval('public."reliquiasMemberRoles_id_seq"'::regclass);


--
-- Name: reliquiasSeasons id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasSeasons" ALTER COLUMN id SET DEFAULT nextval('public."reliquiasSeasons_id_seq"'::regclass);


--
-- Name: scheduleEntries id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."scheduleEntries" ALTER COLUMN id SET DEFAULT nextval('public."scheduleEntries_id_seq"'::regclass);


--
-- Name: schedules id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.schedules ALTER COLUMN id SET DEFAULT nextval('public.schedules_id_seq'::regclass);


--
-- Name: screenshotUploads id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."screenshotUploads" ALTER COLUMN id SET DEFAULT nextval('public."screenshotUploads_id_seq"'::regclass);


--
-- Name: strategyAnalysis id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."strategyAnalysis" ALTER COLUMN id SET DEFAULT nextval('public."strategyAnalysis_id_seq"'::regclass);


--
-- Name: subAdmins id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."subAdmins" ALTER COLUMN id SET DEFAULT nextval('public."subAdmins_id_seq"'::regclass);


--
-- Name: systemBackups id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."systemBackups" ALTER COLUMN id SET DEFAULT nextval('public."systemBackups_id_seq"'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: sapuri
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	9aefec5d1b3241a549343b128e6f7d464c9cb4e80596c840734171bdc8a88ef2	1772656447191
\.


--
-- Data for Name: aiChatHistory; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."aiChatHistory" (id, "userId", role, message, context, "createdAt") FROM stdin;
\.


--
-- Data for Name: aiChatSessions; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."aiChatSessions" (id, "userId", title, context, "messageCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: announcementRecipients; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."announcementRecipients" (id, "announcementId", "memberId", "createdAt") FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.announcements (id, "eventTypeId", title, message, "createdBy", "sentAt", "isGeneral", "createdAt") FROM stdin;
\.


--
-- Data for Name: arayashiki_synergies; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.arayashiki_synergies (id, character1, character2, "synergyType", description, "createdAt") FROM stdin;
\.


--
-- Data for Name: botConfig; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."botConfig" (id, "telegramBotToken", "telegramGroupId", "isActive", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cardBackups; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."cardBackups" (id, "cardId", "backupType", "cardData", "backupReason", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: cards; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.cards (id, name, "imageUrl", "referenceLink", "usageLimit", "bonusDmg", "bonusDef", "bonusVid", "bonusPress", "bonusEsquiva", "bonusVelAtaq", "bonusTenacidade", "bonusSanguessuga", "bonusRedDano", "bonusCrit", "bonusCura", "bonusCuraRecebida", "bonusPrecisao", "bonusVida", "skillEffect", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: characterCloth; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."characterCloth" (id, character_id, level, description, hp_boost, atk_boost, def_boost, haste) FROM stdin;
\.


--
-- Data for Name: characterConstellations; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."characterConstellations" (id, character_id, constellation_name, description, level, hp_boost, dodge, atk_boost, crit, def_boost, hit) FROM stdin;
\.


--
-- Data for Name: characterLinks; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."characterLinks" (id, character_id, link_name, description, level) FROM stdin;
\.


--
-- Data for Name: characterSkills; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."characterSkills" (id, character_id, skill_name, skill_type, description, start_time, end_time, delay, cooldown, cosmos_gain_atk, cosmos_gain_dmg) FROM stdin;
\.


--
-- Data for Name: characters; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.characters (id, name, class, type, summon_type, release_date, stars, level, hp, atk, def, attack_rate, tenacity, cosmos_gain_atk, cosmos_gain_dmg, dano_percent, defesa_percent, resistencia, pressa, esquiva_percent, vel_ataque_percent, tenacidade, sanguessuga, dano_vermelho_percent, tax_critico, precisao, cura_percent, cura_recebida_percent, bonus_vida_percent, red_dano_percent, esquiva_valor, efeito_habilidade, image_url, ssloj_url, last_updated) FROM stdin;
\.


--
-- Data for Name: eventTypes; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."eventTypes" (id, name, "displayName", "maxPlayers", "eventTime", "reminderMinutes", "isActive", "createdAt") FROM stdin;
1	gvg	GvG	20	13:00	30	t	2026-03-05 00:13:59.124395
2	got	GoT	25	13:00	30	t	2026-03-05 00:13:59.12654
3	reliquias	Relíquias	40	15:00	30	t	2026-03-05 00:13:59.128137
\.


--
-- Data for Name: gotAttacks; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gotAttacks" (id, "scheduleId", "memberId", "eventDate", "attackVictories", "attackDefeats", "defenseVictories", "defenseDefeats", points, "previousPoints", "pointsDifference", ranking, "didNotAttack", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gotStrategies; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gotStrategies" (id, name, observation, "attackFormation1", "attackFormation2", "attackFormation3", "defenseFormation1", "defenseFormation2", "defenseFormation3", "usageCount", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gotStrategyBackups; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gotStrategyBackups" (id, "strategyId", "backupType", "strategyData", "backupReason", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: gvgAttacks; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gvgAttacks" (id, "scheduleId", "memberId", "eventDate", "attack1Stars", "attack1Missed", "attack1Opponent", "attack2Stars", "attack2Missed", "attack2Opponent", "didNotAttack", "previousValidStars", "currentValidStars", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gvgMatchInfo; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gvgMatchInfo" (id, "eventDate", "opponentGuild", "ourScore", "opponentScore", "validStars", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gvgSeasons; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gvgSeasons" (id, name, status, "startDate", "endDate", "returnDate", description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gvgStrategies; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gvgStrategies" (id, name, "attackFormation1", "attackFormation2", "attackFormation3", "attackFormation4", "attackFormation5", "defenseFormation1", "defenseFormation2", "defenseFormation3", "defenseFormation4", "defenseFormation5", "usageCount", "createdBy", "createdAt", "updatedAt") FROM stdin;
1	Explosivo 	SeiyaD	ShunV	Aiacos	Kaiser	Seiya Sagitario	Ikki	SeiyaD	Taça (Suikyo)	Hades	ShunD	0	1	2026-03-05 00:14:45.421669	2026-03-05 00:14:45.421669
2	Explosivo	Kaiser	Aiacos	ShunV	Seiya Sagitario	Poseidon	Hades	MuD	ShunD	Odysseus	MiloD	0	1	2026-03-05 00:14:45.684661	2026-03-05 00:14:45.684661
3	Meta	Ikki	Taça (Suikyo)	ShunD	CamusD	Hades	Ikki	Hypnos	Taça (Suikyo)	Hades	ShunD	0	1	2026-03-05 00:14:45.977562	2026-03-05 00:14:45.977562
4	Meta	Ikki	Taça (Suikyo)	CamusD	ShunD	Hades	ShiryuD	Deusa da Guerra (Atena)	HyogaD	ShunD	Ikki	0	1	2026-03-05 00:14:46.26713	2026-03-05 00:14:46.26713
5	Milo	Hades	Ikki	CamusD	MuD	MiloD	Ikki	ShiryuD	ShunD	Poseidon	Hades	0	1	2026-03-05 00:14:46.562312	2026-03-05 00:14:46.562312
6	Alternativo	Kaiser	SeiyaD	ShunV	Seiya Sagitario	ShuraD	Ox	CamusD	Hades	ShunD	MuD	0	1	2026-03-05 00:14:46.85933	2026-03-05 00:14:46.85933
7	x	Hades	Ikki	CamusD	Hypnos	MuD	ShiryuD	Deusa da Guerra (Atena)	Poseidon	ShunD	HyogaD	0	1	2026-03-05 00:14:47.151151	2026-03-05 00:14:47.151151
8	Gelo	Ox	CamusD	Poseidon	HyogaD	MuD	ShiryuD	Ikki	HyogaD	ShunD	SeiyaD	0	1	2026-03-05 00:14:47.458088	2026-03-05 00:14:47.458088
9	x	Taça (Suikyo)	Hypnos	ShunD	Ikki	Hades	Hypnos	Ikki	ShunD	Taça (Suikyo)	Hades	0	1	2026-03-05 00:14:47.741662	2026-03-05 00:14:47.741662
10	x	Ikki	CamusD	Hades	ShunD	MuD	Ikki	Hades	SeiyaD	Poseidon	ShunD	0	1	2026-03-05 00:14:48.039215	2026-03-05 00:14:48.039215
11	Trevas x Meta	Taça (Suikyo) 	Aiacos	Suikyo (Garruda)	Hades	ShunD	Hades	Taça (Suikyo) 	Ikki	ShunD	SeiyaD	0	1	2026-03-05 00:14:48.604228	2026-03-05 00:14:48.604228
12	Milo	Suikyo (Garruda) 	Poseidon	Aiacos	ShunD	Hades	Hypnos	MiloD	Hades	Ikki	ShunD	0	1	2026-03-05 00:14:48.982276	2026-03-05 00:14:48.982276
13	Alternativo	Ox	Ikki	MiloD	CamusD	MuD	ShiryuD	Hades	CamusD	Hypnos	ShunD	0	1	2026-03-05 00:14:49.625156	2026-03-05 00:14:49.625156
14	X	CamusD	Ox	Taça (Suikyo) 	Hades	MuD	Ikki	Hypnos	Hades	ShunD	Taça (Suikyo) 	0	1	2026-03-05 00:14:50.071546	2026-03-05 00:14:50.071546
15	Alone	Aiacos	Ikki	ShunD	Alone	Hades	Ikki	Hypnos	Hades	ShunD	Aiacos	0	1	2026-03-05 00:14:50.376823	2026-03-05 00:14:50.376823
16	Shijima	Shijima	CamusD	MuD	Seyia Sagitario	MiloD	Taça (Suikyo) 	Ikki	Hades	CamusD	ShunD	0	1	2026-03-05 00:14:50.668598	2026-03-05 00:14:50.668598
17	x	Shijima	Deusa da Guerra (Atena)	Shaka Arayashiki	Shaka	ShuV	Ikki	Hypnos	ShunD	Hades	CamusD	0	1	2026-03-05 00:14:50.9828	2026-03-05 00:14:50.9828
18	x	CamusD	Ox	Hades	MuD	MiloD	Hypnos	CamusD	Ikki	ShunD	Hades	0	1	2026-03-05 00:14:51.290912	2026-03-05 00:14:51.290912
19	x	ShiryuD	Ikki	Shijima	ShunD	Seiya Sagitario	Shiryu Ouro	SeiyaD	Shura Ouro	Pandora	Deusa da Guerra (Atena)	0	1	2026-03-05 00:14:51.596136	2026-03-05 00:14:51.596136
20	x	Shijima	MuD	ShunD	Seiya Sagitario	MiloD	Ikki	Taça (Suikyo) 	Hades	ShunD	SeiyaD	0	1	2026-03-05 00:14:51.914897	2026-03-05 00:14:51.914897
21	x	Ox	CamusD	Poseidon	ShunD	HyogaD	Ikki	Taça (Suikyo) 	Hades	SeiyaD	ShunD	0	1	2026-03-05 00:14:52.244853	2026-03-05 00:14:52.244853
22	x	MuD	Shijima	Hades	ShunD	MiloD	Hypnos	MiloD	Hades	Ikki	ShunD	0	1	2026-03-05 00:14:52.567116	2026-03-05 00:14:52.567116
23	x	Ikki	CamusD	Seiya Sagitario	Artemis	Poseidon	Ikki	Taça (Suikyo) 	Hades	ShunD	SeiyaD	0	1	2026-03-05 00:14:52.884587	2026-03-05 00:14:52.884587
24	x	Ikki	Shijima	MiloD	Seiya Sagitario 	MuD	Ikki	Hypnos	ShunD	Hades	Taça (Suikyo) 	0	1	2026-03-05 00:14:53.209872	2026-03-05 00:14:53.209872
25	x	Shijima	Shaka Arayashiki	Hades	Seiya Sagitario	Ikki	Kanon	Taça (Suikyo) 	Ikki	ShunD	SeiyaD	0	1	2026-03-05 00:14:53.51909	2026-03-05 00:14:53.51909
26	x	Odysseus	MuD	Poseidon	MiloD	ShunD	ShiryuD	Poseidon	ShunD	Ikki	Hades	0	1	2026-03-05 00:14:53.812885	2026-03-05 00:14:53.812885
27	x	Ikki	Shijima	Seiya Sagitario	MiloD	Shaka Arayashiki	Ox	Ikki	ShunD	Hades	CamusD	0	1	2026-03-05 00:14:54.093544	2026-03-05 00:14:54.093544
28	x	Shijima	CamusD	MuD	Seiya Sagitario	MiloD	Taça (Suikyo) 	Ikki	Hades	CamusD	ShunD	0	1	2026-03-05 00:14:54.466626	2026-03-05 00:14:54.466626
29	x	Hypnos	CamusD	Ikki	Hades	ShunD	Ikki	Taça (Suikyo)	Hades	ShunD	CamusD	0	1	2026-03-05 00:14:54.87257	2026-03-05 00:14:54.87257
30	x	MiloD	Aiacos	Taça (Suikyo)	MuD	Artemis	Ikki	Hades	MiloD	CamusD	ShunD	0	1	2026-03-05 00:14:55.330487	2026-03-05 00:14:55.330487
31	x	Ox	CamusD	Poseidon	HyogaD	MiloD	Ikki	Taça (Suikyo)	Hades	ShunD	Poseidon	0	1	2026-03-05 00:14:55.712433	2026-03-05 00:14:55.712433
32	x	SeiyaD	Aiacos	Seiya Sagitario	Kaiser	ShunV	Ikki	Taça (Suikyo)	ShunD	Hades	CamusD	0	1	2026-03-05 00:14:56.065265	2026-03-05 00:14:56.065265
33	X	Minos	Hades	MuD	MiloD	Seiya Sagitario 	Hades	Shijima	MiloD 	Seiya Sagitario	MuD	0	1	2026-03-05 00:14:56.342721	2026-03-05 00:14:56.342721
34	x	Aiacos	Poseidon	Seiya Sagitario	Kaiser	ShunV	Shijima	Hades	MuD	ShunD	MiloD	0	1	2026-03-05 00:14:56.624802	2026-03-05 00:14:56.624802
35	x	CamusD	Minos	Hades	MuD	MiloD	Hypnos	CamusD	Hades	MuD	MiloD	0	1	2026-03-05 00:14:56.905402	2026-03-05 00:14:56.905402
36	x	ShiryuD	MiloD	Hades	Shijima	ShunD	Hypnos	Ikki	ShunD	Hades	Minos	0	1	2026-03-05 00:14:57.185332	2026-03-05 00:14:57.185332
37	x	CamusD	Ox	MuD	Poseidon	Artemis	Hypnos	Hades	Ikki	MuD	CamusD	0	1	2026-03-05 00:14:57.463715	2026-03-05 00:14:57.463715
38	x	Hades	Hypnos	Shaka Arayashiki	ShunD	CamusD	Hades	Ikki	ShunD	CamusD	Hypnos	0	1	2026-03-05 00:14:57.744543	2026-03-05 00:14:57.744543
39	x	ShiryuD	Ikki	MuD	Odysseus	MiloD	Hypnos	Ikki	ShunD	Hades	CamusD	0	1	2026-03-05 00:14:58.035529	2026-03-05 00:14:58.035529
40	x	Hypnos	MuD	CamusD	Hades	MiloD	Hades	CamusD	MiloD	Poseidon	MuD	0	1	2026-03-05 00:14:58.582796	2026-03-05 00:14:58.582796
41	x	Ikki	Hecate	ShunD	DohkoD	Artemis	Hypnos	Ikki	ShunD	Hades	CamusD	0	1	2026-03-05 00:14:58.881073	2026-03-05 00:14:58.881073
42	x	Aiacos	SeiyaD	Seiya Sagitario	ShunV	Kaiser	Taça (Suikyo)	Ikki	ShunD	Hades	Hypnos	0	1	2026-03-05 00:14:59.330154	2026-03-05 00:14:59.330154
43	x	Aiacos	Hades	Suikyo (Garruda)	Taça (Suikyo)	ShunD	Ikki	Hypnos	Shaka Arayashiki	Hades	ShunD	0	1	2026-03-05 00:14:59.731321	2026-03-05 00:14:59.731321
44	x	Hades	Minos	MuD	Shijima	MiloD	Ikki	MuD	Hades	ShunD	MiloD	0	1	2026-03-05 00:15:00.09539	2026-03-05 00:15:00.09539
45	x	Kaiser	Poseidon	ShunV	Seiya Sagitario	Aiacos	Hades	MiloD	ShunD	CamusD	MuD	0	1	2026-03-05 00:15:00.396184	2026-03-05 00:15:00.396184
46	x	Kaiser	Aiacos	SeiyaD	Seiya Sagitario	ShunV	Minos	Hades	Seiya Sagitario	MuD	MiloD	0	1	2026-03-05 00:15:00.712715	2026-03-05 00:15:00.712715
47	x	ShunV	Seiya Sagitario	Kaiser	Poseidon	Aiacos	Ox	CamusD	Hades	MiloD	MuD	0	1	2026-03-05 00:15:01.017421	2026-03-05 00:15:01.017421
48	x	Hypnos	Minos	Ikki	Hades	ShunD	Ikki	CamusD	Hades	MuD	ShunD	0	1	2026-03-05 00:15:01.298397	2026-03-05 00:15:01.298397
49	x	SeiyaD	Aiacos	ShunD	Seiya Sagitario	Kaiser	Ikki	MuD	Hades	ShunD	MiloD	0	1	2026-03-05 00:15:01.583651	2026-03-05 00:15:01.583651
50	x	Atena (Mendiga)	ShiryuD	Seiya Sagitario	MuD	MiloD	Hades	Ikki	Shijima	ShunD	Poseidon	0	1	2026-03-05 00:15:01.887452	2026-03-05 00:15:01.887452
51	x	SeiyaD	Aiacos	Kaiser	Seiya Sagitario	ShunV	Seiya Sagitario	Hades	ShunD	MiloD	MuD	0	1	2026-03-05 00:15:02.252536	2026-03-05 00:15:02.252536
52	x	Aiacos	Ox	Hades	CamusD	ShunD	Ikki	Hypnos	ShunD	Hades	CamusD	0	1	2026-03-05 00:15:02.667899	2026-03-05 00:15:02.667899
53	x	Ikki	Hades	CamusD	MuD	MiloD	Hypnos	Taça (Suikyo)	ShunD	Hades	Ikki	0	1	2026-03-05 00:15:02.977937	2026-03-05 00:15:02.977937
54	x	Ox	CamusD	Poseidon	MuD	HyogaD	Deusa da Guerra (Atena)	Hades	Poseidon	Ikki	ShunD	0	1	2026-03-05 00:15:03.296865	2026-03-05 00:15:03.296865
55	x	Taça (Suikyo)	CamusD	Ikki	ShunD	Hades	ShiryuD	Shaka Arayashiki	Hades	CamusD	ShunD	0	1	2026-03-05 00:15:03.549691	2026-03-05 00:15:03.549691
56	x	Poseidon	Shaka Arayashiki	Seiya Sagitario	CamusD	Shijima	Hades	Poseidon	MuD	Minos	MiloD	0	1	2026-03-05 00:15:03.840362	2026-03-05 00:15:03.840362
57	x	Ikki	Minos	MiloD	MuD	Hades	ShiryuD	Odysseus	Hades	Minos	ShunD	0	1	2026-03-05 00:15:04.081574	2026-03-05 00:15:04.081574
58	x	Poseidon	Kaiser	ShunV	SeiyaD	Seiya Sagitario	Odysseus	Hades	MuD	Poseidon	MiloD	0	1	2026-03-05 00:15:04.324134	2026-03-05 00:15:04.324134
59	x	Shijima	Shaka Arayashiki	SeiyaD	Seiya Sagitario	Poseidon	Shijima	Odysessus	Poseidon	MuD	MiloD	0	1	2026-03-05 00:15:04.568995	2026-03-05 00:15:04.568995
60	x	Ox	CamusD	Hades	MiloD	ShunD	Ikki	Odysseus	Hades	ShunD	Minos	0	1	2026-03-05 00:15:04.82668	2026-03-05 00:15:04.82668
61	x	Shijima	MuD	MiloD	Seiya Sagitario	SeiyaD	Mu	Poseidon	Hades	ShunD	Seiya Sagitario	0	1	2026-03-05 00:15:05.091668	2026-03-05 00:15:05.091668
62	x	Ikki	Poseidon	Shaka Arayashiki	Shijima	Seiya Sagitario	Shiryu	Poseidon	Hades	Shaka Arayashiki	MuD	0	1	2026-03-05 00:15:05.348859	2026-03-05 00:15:05.348859
63	x	Ikki	Poseidon	Shaka Arayashiki	Shijima	Seiya Sagitario	ShiryuD	Poseidon	Hades	Shaka Arayashiki	MuD	0	1	2026-03-05 00:15:05.582602	2026-03-05 00:15:05.582602
64	x	Aiacos	SeiyaD	ShunV	Kaiser	Seiya Sagitario	Hades	Poseidon	MuD	Minos	MiloD	0	1	2026-03-05 00:15:05.811028	2026-03-05 00:15:05.811028
65	x	Poseidon	Kaiser	ShunV	Seiya Sagitario	SeiyaD	Aiacos	Odysseus	Hades	ShunD	CamusD	0	1	2026-03-05 00:15:06.047702	2026-03-05 00:15:06.047702
66	x	Shijima	MuD	ShunD	Hades	MiloD	ShiryuD	MiloD	MInos	Hades	Shijima	0	1	2026-03-05 00:15:06.66954	2026-03-05 00:15:06.66954
67	x	Shaka Arayashiki	Shijima	Seiya Sagitario	Artemis	Ikki	Ikki	MiloD	MuD	Hades	CamusD	0	1	2026-03-05 00:15:06.992251	2026-03-05 00:15:06.992251
68	x	Shijima	Hades	Seiya Sagitario	MiloD	ShunD	Minos	Ikki	MiloD	Hades	MuD	0	1	2026-03-05 00:15:07.292864	2026-03-05 00:15:07.292864
69	x	Shijima	Shaka Arayashiki	Seiya Sagitario	Poseidon	Ikki	Shaka Arayashiki	Hades	Odysseus	MiloD	MuD	0	1	2026-03-05 00:15:07.602413	2026-03-05 00:15:07.602413
70	x	Odysseus	CamusD	ShunD	Ox	Hades	ShiryuD	Hades	MuD	Minos 	Shaka Arayashiki	0	1	2026-03-05 00:15:08.090002	2026-03-05 00:15:08.090002
71	x	Shijima	MiloD	Seiya Sagitario	MuD	Artemi	ShiryuD	Shijima	Poseidon	MuD	MiloD	0	1	2026-03-05 00:15:08.342441	2026-03-05 00:15:08.342441
72	x	MuD	Shijima	Artemis	Seiya Sagitario	MiloD	Pandora	Hades	Mu	Poseidon	MiloD	0	1	2026-03-05 00:15:08.578806	2026-03-05 00:15:08.578806
73	x	Shijima	Hades	ShunD	HyogaD	Minos	Shijima	Hades	MuD	Odysseus	MiloD	0	1	2026-03-05 00:15:08.819933	2026-03-05 00:15:08.819933
74	x	Shaka Arayashiki	CamusD	Seiya Sagitario	Deusa da Guerra (Atena)	MuD	Shijima	Shaka Arayashiki	Poseidon	Seiya Sagitario	Atena (Mendiga)	0	1	2026-03-05 00:15:09.063648	2026-03-05 00:15:09.063648
75	x	ShiryuD	Poseidon	MuD	Hades	Minos	Shijima	Hades	Poseidon	MuD	MiloD	0	1	2026-03-05 00:15:09.356183	2026-03-05 00:15:09.356183
76	x	Hades	Poseidon	MuD	Minos	MiloD	Shijima	Odysseus	MuD	Hades	MiloD	0	1	2026-03-05 00:15:09.635663	2026-03-05 00:15:09.635663
77	x	Shijima	Hades	ShunD	Seiya Sagitario	Minos	Shijima	MuD	ShunD	Hades	MiloD	0	1	2026-03-05 00:15:09.891015	2026-03-05 00:15:09.891015
78	x	Shijima	Hades	ShunD	Seiya Sagitario	Minos	Shijima	Mu	Shun	Hades	MiloD	0	1	2026-03-05 00:15:10.162278	2026-03-05 00:15:10.162278
79	x	ShiryuD	Poseidon	MuD	Hades	MiloD	Hades	Shijima	ShunD	Seiya Sagitario	Ikki	0	1	2026-03-05 00:15:10.765589	2026-03-05 00:15:10.765589
80	x	MiloD	MuD	Odysseus	Minos	Hades	CamusD	Ox	Shaka Arayashiki	Hades	ShunD	0	1	2026-03-05 00:15:11.212623	2026-03-05 00:15:11.212623
81	x	ShuraD	Poseidon	ShunV	Seiya Sagitario	Kaiser	Ox	MiloD	MuD	Odysseus	CamusD	0	1	2026-03-05 00:15:11.786793	2026-03-05 00:15:11.786793
82	x	Kaiser	ShuraD	Aiacos	ShunV	Seiya Sagitario	Shijima	Odysseus	Hades	Seiya Sagitario	MiloD	0	1	2026-03-05 00:15:12.081218	2026-03-05 00:15:12.081218
83	x	Minos	Shun Hades	MiloD	Hades	MuD	CamusD	MiloD	MuD	ShunD	Poseidon	0	1	2026-03-05 00:15:12.327024	2026-03-05 00:15:12.327024
84	x	ShiryuD	Poseidon	CamusD	ShunD	Kain - Abel	Shijima	Deusa da Guerra (Atena)	Shaka Arayashiki	ShunV	Shaka	0	1	2026-03-05 00:15:12.563927	2026-03-05 00:15:12.563927
85	x	Odysseus	Hades	Artemis	MiloD	MuD	Ox	Hades	CamusD	ShunD	MiloD	0	1	2026-03-05 00:15:12.82975	2026-03-05 00:15:12.82975
86	x	Ox	MiloD	DohkoD	ShunD	Poseidon	Shiryu	Ikki	ShunD	Deusa da Guerra (Atena)	HyogaD	0	1	2026-03-05 00:15:13.061799	2026-03-05 00:15:13.061799
87	x	Shijima	Odysseus	ShunD	Hades	MiloD	Hypnos	Ikki	ShunD	Hades	Minos	0	1	2026-03-05 00:15:13.310249	2026-03-05 00:15:13.310249
88	x	Ox	CamusD	MuD	Poseidon	HyogaD	ShiryuD	CamusD	Hades	MuD	MiloD	0	1	2026-03-05 00:15:13.557125	2026-03-05 00:15:13.557125
89	x	Odysseus	Shijima	ShunD	Hades	MiloD	Hypnos	CamusD	MiloD	Hades	MuD	0	1	2026-03-05 00:15:13.794978	2026-03-05 00:15:13.794978
90	x	CamusD	Ox	HyogaD	MiloD	MuD	MuD	Ikki	Hades	ShunD	CamusD	0	1	2026-03-05 00:15:14.04638	2026-03-05 00:15:14.04638
91	x	ShiryuD	MiloD	MuD	CamusD	Poseidon	Ikki	Hades	MuD	ShunD	MiloD	0	1	2026-03-05 00:15:14.320874	2026-03-05 00:15:14.320874
92	x	Hades	ShunD	Ikki	Seiya Sagitario	MuD	Ikki	Hades	CamusD	MiloD	MuD	0	1	2026-03-05 00:15:14.577394	2026-03-05 00:15:14.577394
93	x	ShiryuD	Hades	MiloD	Poseidon	MuD	CamusD	Hades	MiloD	ShunD	MuD	0	1	2026-03-05 00:15:14.809536	2026-03-05 00:15:14.809536
94	x	Taça (Suikyo)	Shiryu Pelado	MuD	Atena (Mendiga)	MiloD	Hypnos	Hades	CamusD	MuD	ShunD	0	1	2026-03-05 00:15:15.094388	2026-03-05 00:15:15.094388
95	x	Hades	Poseidon	Ikki	MuD	ShunD	Ikki	MiloD	Hades	MuD	CamusD	0	1	2026-03-05 00:15:15.342419	2026-03-05 00:15:15.342419
\.


--
-- Data for Name: gvgStrategyBackups; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."gvgStrategyBackups" (id, "strategyId", "backupType", "strategyData", "backupReason", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.members (id, name, "telegramId", "telegramUsername", "telegramChatId", "phoneNumber", "participatesGvg", "participatesGot", "participatesReliquias", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: nonAttackerAlerts; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."nonAttackerAlerts" (id, "eventTypeId", "eventDate", "memberId", "alertSent", "adminNotified", "createdAt") FROM stdin;
\.


--
-- Data for Name: performanceRecords; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."performanceRecords" (id, "eventTypeId", "eventDate", "memberId", attacked, notes, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: reliquiasBossProgress; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."reliquiasBossProgress" (id, "seasonId", "bossId", "bossName", "currentHp", "maxHp", stage, "isDefeated", "createdAt", "updatedAt") FROM stdin;
1	1	1	Orfeu	100	100	1	t	2025-12-30 22:10:22	2025-12-30 22:21:10
2	1	2	Radamantis	100	100	1	f	2025-12-30 22:10:22	2025-12-30 22:10:22
3	1	3	Pandora	100	100	1	f	2025-12-30 22:10:22	2025-12-30 22:10:22
4	1	4	Gêmeos	100	100	1	f	2025-12-30 22:10:22	2025-12-30 22:10:22
\.


--
-- Data for Name: reliquiasDamage; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."reliquiasDamage" (id, "seasonId", "memberId", "cumulativeDamage", "damageNumeric", ranking, power, "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: reliquiasMemberAssignments; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."reliquiasMemberAssignments" (id, "memberId", "bossName", "seasonId", "bossId", "assignedAt", "unassignedAt", "createdAt", "updatedAt", "attackNumber", role, "guard1Number", "guard2Number", performance) FROM stdin;
1	90014	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052314	20260126182140	1	guards	\N	\N	\N
2	30004	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052314	20260126182140	1	guards	\N	\N	\N
3	2	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052314	20260126182140	1	guards	\N	\N	\N
4	30012	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052408	20260126182140	1	guards	\N	\N	\N
5	30005	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052408	20260126182140	1	guards	\N	\N	\N
6	30006	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052408	20260126182140	1	guards	\N	\N	\N
7	90003	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052419	20260126182140	1	guards	\N	\N	\N
8	90008	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052440	20260126182140	1	guards	\N	\N	\N
9	30003	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052456	20260126182140	1	guards	\N	\N	\N
10	30015	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052509	20260126182140	1	guards	\N	\N	\N
11	1	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052520	20260126182140	1	guards	\N	\N	\N
12	30016	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052539	20260126182140	1	guards	\N	\N	\N
13	60001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052553	20260126182140	1	guards	\N	\N	\N
14	30001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052711	20260126182140	1	guards	\N	\N	\N
15	90010	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052711	20260226162536	1	guards	1	\N	\N
16	30008	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052711	20260126182140	1	guards	\N	\N	\N
17	30013	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052711	20260126182140	1	guards	\N	\N	\N
18	30018	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052711	20260126182140	1	guards	\N	\N	\N
19	90018	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052742	20260126182140	1	guards	\N	\N	\N
20	90017	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052742	20260126182140	1	guards	\N	\N	\N
21	90002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052808	20260126182140	1	guards	\N	\N	\N
22	60002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052822	20260126182140	1	guards	\N	\N	\N
23	90004	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052950	20260126182140	1	guards	\N	\N	\N
24	30010	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052950	20260126182140	1	guards	\N	\N	\N
25	90013	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231052950	20260126182140	1	guards	\N	\N	\N
26	90016	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053010	20260126182140	1	guards	\N	\N	\N
27	90006	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053023	20260126182140	1	guards	\N	\N	\N
28	90007	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053100	20260126182140	1	guards	\N	\N	\N
29	90001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053135	20260126182140	1	guards	\N	\N	\N
30	30002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053154	20260126182140	1	guards	\N	\N	\N
31	90012	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053204	20260126182140	1	guards	\N	\N	\N
32	90015	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053231	20260126182140	1	guards	\N	\N	\N
33	90005	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053251	20260126182140	1	guards	\N	\N	\N
34	150001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053302	20260126182140	1	guards	\N	\N	\N
35	30017	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231053315	20260126182140	1	guards	\N	\N	\N
36	150002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231054222	20260126182140	1	guards	\N	\N	\N
37	90022	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231054255	20260126182140	1	guards	\N	\N	\N
38	90009	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231054456	20260126182140	1	guards	\N	\N	\N
39	30007	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231054456	20260126182140	1	guards	\N	\N	\N
40	30014	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231054456	20260126182140	1	guards	\N	\N	\N
41	30009	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231054456	20260126182140	1	guards	\N	\N	\N
30001	90010	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30002	30015	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30003	150001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30004	30009	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30005	90009	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30006	90001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30007	30017	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30008	90015	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30009	90018	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30010	30008	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30011	90012	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30012	90007	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30013	30002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30014	90006	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30015	90003	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30016	90005	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30017	30013	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30018	30001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30019	150002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30020	90016	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30021	90017	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30022	30003	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30023	60002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30024	30016	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30025	90002	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30026	90004	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30027	90013	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30028	60001	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30029	2	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30030	90022	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231132515	20260126182140	1	guards	\N	\N	\N
30031	30004	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231141006	20260126182140	1	guards	\N	\N	\N
30032	90014	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231141006	20260126182140	1	guards	\N	\N	\N
30033	30005	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231141006	20260126182140	1	guards	\N	\N	\N
30034	30012	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231141006	20260126182140	1	guards	\N	\N	\N
30035	30006	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231141006	20260126182140	1	guards	\N	\N	\N
30036	1	Orfeu	1	1	2024-12-31 00:00:00	\N	20251231141006	20260126182140	1	guards	\N	\N	\N
60001	30002	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60002	30015	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60003	150001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60004	90010	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60005	90013	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60006	90012	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60007	30017	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60008	90005	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153137	20260126182140	1	guards	\N	\N	\N
60009	30010	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60010	30018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60011	30016	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60012	90004	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60013	30005	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60014	90016	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60015	90006	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60016	30003	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60017	150002	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60018	90003	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60019	90018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60020	60001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60021	90015	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60022	90001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153448	20260126182140	1	guards	\N	\N	\N
60023	30002	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60024	90015	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60025	60001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60026	30018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60027	30015	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60028	30001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60029	150001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60030	30004	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60031	2	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60032	30017	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60033	90010	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60034	90012	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60035	90022	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60036	60002	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60037	90014	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60038	30003	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60039	30016	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60040	90001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101153956	20260126182140	1	guards	\N	\N	\N
60041	90016	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60042	30013	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60043	90005	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60044	90006	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60045	30005	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60046	90007	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60047	90018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154144	20260126182140	1	guards	\N	\N	\N
60048	90015	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154352	20260126182140	1	guards	\N	\N	\N
60049	90001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154352	20260126182140	1	guards	\N	\N	\N
60050	30017	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154352	20260126182140	1	guards	\N	\N	\N
60051	30006	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154352	20260126182140	1	guards	\N	\N	\N
60052	90004	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154352	20260126182140	1	guards	\N	\N	\N
60053	30002	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154352	20260126182140	1	guards	\N	\N	\N
60054	30013	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154430	20260126182140	1	guards	\N	\N	\N
60055	90014	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154430	20260126182140	1	guards	\N	\N	\N
60056	30010	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154430	20260126182140	1	guards	\N	\N	\N
60057	30001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60058	30018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60059	90002	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60060	90018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60061	60001	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60062	90010	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60063	90003	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60064	30012	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60065	90013	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60066	90006	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60067	1	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154635	20260126182140	1	guards	\N	\N	\N
60068	30009	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154723	20260126182140	1	guards	\N	\N	\N
60069	30016	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154723	20260126182140	1	guards	\N	\N	\N
60070	90022	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154723	20260126182140	1	guards	\N	\N	\N
60071	90016	Orfeu	1	1	2024-12-31 00:00:00	\N	20260101154723	20260126182140	1	guards	\N	\N	\N
90001	30010	Orfeu	1	1	2024-12-31 00:00:00	\N	20260102025030	20260126182140	1	guards	\N	\N	\N
90002	30018	Orfeu	1	1	2024-12-31 00:00:00	\N	20260102025030	20260126182140	1	guards	\N	\N	\N
90003	90008	Orfeu	1	1	2024-12-31 00:00:00	\N	20260102025030	20260126182140	1	guards	\N	\N	\N
\.


--
-- Data for Name: reliquiasMemberRoles; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."reliquiasMemberRoles" (id, "seasonId", "memberId", role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reliquiasSeasons; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."reliquiasSeasons" (id, name, "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
1	Temporada 1 - Dezembro 2024	2024-12-30 00:00:00	2026-02-26 00:00:00	f	2026-01-15 10:00:00	2026-02-26 17:33:23
30002	Temporada 1 - Fevereiro 2026	2026-02-28 00:00:00	\N	f	2026-02-28 02:11:05	2026-02-28 02:12:08
30003	Temporada 1 - Fevereiro 2026	2026-02-28 00:00:00	2026-02-28 00:00:00	f	2026-02-28 02:12:08	2026-02-28 03:25:33
60002	Temporada 1 - Fevereiro 2026	2026-02-28 00:00:00	\N	t	2026-02-28 04:25:52	2026-02-28 04:25:52
\.


--
-- Data for Name: scheduleEntries; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."scheduleEntries" (id, "scheduleId", "memberId", "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.schedules (id, "eventTypeId", "eventDate", "createdBy", "notificationSent", "reminderSent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: screenshotUploads; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."screenshotUploads" (id, "eventTypeId", "eventDate", "imageUrl", "imageKey", "extractedData", processed, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: strategyAnalysis; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."strategyAnalysis" (id, "strategyId", analysis, suggestions, strengths, weaknesses, rating, "analyzedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subAdmins; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."subAdmins" (id, name, username, password, "canManageGvg", "canManageGot", "canManageReliquias", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: systemBackups; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public."systemBackups" (id, "backupName", description, "backupData", "backupSize", "backupType", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sapuri
--

COPY public.users (id, "openId", name, email, "loginMethod", role, "createdAt", "updatedAt", "lastSignedIn") FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: sapuri
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: aiChatHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."aiChatHistory_id_seq"', 1, false);


--
-- Name: aiChatSessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."aiChatSessions_id_seq"', 1, false);


--
-- Name: announcementRecipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."announcementRecipients_id_seq"', 1, false);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: arayashiki_synergies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.arayashiki_synergies_id_seq', 1, false);


--
-- Name: botConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."botConfig_id_seq"', 1, false);


--
-- Name: cardBackups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."cardBackups_id_seq"', 1, false);


--
-- Name: cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.cards_id_seq', 1, false);


--
-- Name: characterCloth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."characterCloth_id_seq"', 1, false);


--
-- Name: characterConstellations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."characterConstellations_id_seq"', 1, false);


--
-- Name: characterLinks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."characterLinks_id_seq"', 1, false);


--
-- Name: characterSkills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."characterSkills_id_seq"', 1, false);


--
-- Name: characters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.characters_id_seq', 1, false);


--
-- Name: eventTypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."eventTypes_id_seq"', 3, true);


--
-- Name: gotAttacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gotAttacks_id_seq"', 1, false);


--
-- Name: gotStrategies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gotStrategies_id_seq"', 1, false);


--
-- Name: gotStrategyBackups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gotStrategyBackups_id_seq"', 1, false);


--
-- Name: gvgAttacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gvgAttacks_id_seq"', 1, false);


--
-- Name: gvgMatchInfo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gvgMatchInfo_id_seq"', 1, false);


--
-- Name: gvgSeasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gvgSeasons_id_seq"', 1, false);


--
-- Name: gvgStrategies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gvgStrategies_id_seq"', 95, true);


--
-- Name: gvgStrategyBackups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."gvgStrategyBackups_id_seq"', 1, false);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.members_id_seq', 1, false);


--
-- Name: nonAttackerAlerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."nonAttackerAlerts_id_seq"', 1, false);


--
-- Name: performanceRecords_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."performanceRecords_id_seq"', 1, false);


--
-- Name: reliquiasBossProgress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."reliquiasBossProgress_id_seq"', 4, true);


--
-- Name: reliquiasDamage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."reliquiasDamage_id_seq"', 1, false);


--
-- Name: reliquiasMemberAssignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."reliquiasMemberAssignments_id_seq"', 90003, true);


--
-- Name: reliquiasMemberRoles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."reliquiasMemberRoles_id_seq"', 1, false);


--
-- Name: reliquiasSeasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."reliquiasSeasons_id_seq"', 60002, true);


--
-- Name: scheduleEntries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."scheduleEntries_id_seq"', 1, false);


--
-- Name: schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.schedules_id_seq', 1, false);


--
-- Name: screenshotUploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."screenshotUploads_id_seq"', 1, false);


--
-- Name: strategyAnalysis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."strategyAnalysis_id_seq"', 1, false);


--
-- Name: subAdmins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."subAdmins_id_seq"', 1, false);


--
-- Name: systemBackups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public."systemBackups_id_seq"', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sapuri
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: sapuri
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: aiChatHistory aiChatHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."aiChatHistory"
    ADD CONSTRAINT "aiChatHistory_pkey" PRIMARY KEY (id);


--
-- Name: aiChatSessions aiChatSessions_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."aiChatSessions"
    ADD CONSTRAINT "aiChatSessions_pkey" PRIMARY KEY (id);


--
-- Name: announcementRecipients announcementRecipients_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."announcementRecipients"
    ADD CONSTRAINT "announcementRecipients_pkey" PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: arayashiki_synergies arayashiki_synergies_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.arayashiki_synergies
    ADD CONSTRAINT arayashiki_synergies_pkey PRIMARY KEY (id);


--
-- Name: botConfig botConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."botConfig"
    ADD CONSTRAINT "botConfig_pkey" PRIMARY KEY (id);


--
-- Name: cardBackups cardBackups_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."cardBackups"
    ADD CONSTRAINT "cardBackups_pkey" PRIMARY KEY (id);


--
-- Name: cards cards_name_unique; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_name_unique UNIQUE (name);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: characterCloth characterCloth_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterCloth"
    ADD CONSTRAINT "characterCloth_pkey" PRIMARY KEY (id);


--
-- Name: characterConstellations characterConstellations_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterConstellations"
    ADD CONSTRAINT "characterConstellations_pkey" PRIMARY KEY (id);


--
-- Name: characterLinks characterLinks_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterLinks"
    ADD CONSTRAINT "characterLinks_pkey" PRIMARY KEY (id);


--
-- Name: characterSkills characterSkills_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."characterSkills"
    ADD CONSTRAINT "characterSkills_pkey" PRIMARY KEY (id);


--
-- Name: characters characters_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_pkey PRIMARY KEY (id);


--
-- Name: eventTypes eventTypes_name_unique; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."eventTypes"
    ADD CONSTRAINT "eventTypes_name_unique" UNIQUE (name);


--
-- Name: eventTypes eventTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."eventTypes"
    ADD CONSTRAINT "eventTypes_pkey" PRIMARY KEY (id);


--
-- Name: gotAttacks gotAttacks_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gotAttacks"
    ADD CONSTRAINT "gotAttacks_pkey" PRIMARY KEY (id);


--
-- Name: gotStrategies gotStrategies_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gotStrategies"
    ADD CONSTRAINT "gotStrategies_pkey" PRIMARY KEY (id);


--
-- Name: gotStrategyBackups gotStrategyBackups_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gotStrategyBackups"
    ADD CONSTRAINT "gotStrategyBackups_pkey" PRIMARY KEY (id);


--
-- Name: gvgAttacks gvgAttacks_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgAttacks"
    ADD CONSTRAINT "gvgAttacks_pkey" PRIMARY KEY (id);


--
-- Name: gvgMatchInfo gvgMatchInfo_eventDate_unique; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgMatchInfo"
    ADD CONSTRAINT "gvgMatchInfo_eventDate_unique" UNIQUE ("eventDate");


--
-- Name: gvgMatchInfo gvgMatchInfo_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgMatchInfo"
    ADD CONSTRAINT "gvgMatchInfo_pkey" PRIMARY KEY (id);


--
-- Name: gvgSeasons gvgSeasons_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgSeasons"
    ADD CONSTRAINT "gvgSeasons_pkey" PRIMARY KEY (id);


--
-- Name: gvgStrategies gvgStrategies_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgStrategies"
    ADD CONSTRAINT "gvgStrategies_pkey" PRIMARY KEY (id);


--
-- Name: gvgStrategyBackups gvgStrategyBackups_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."gvgStrategyBackups"
    ADD CONSTRAINT "gvgStrategyBackups_pkey" PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: nonAttackerAlerts nonAttackerAlerts_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."nonAttackerAlerts"
    ADD CONSTRAINT "nonAttackerAlerts_pkey" PRIMARY KEY (id);


--
-- Name: performanceRecords performanceRecords_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."performanceRecords"
    ADD CONSTRAINT "performanceRecords_pkey" PRIMARY KEY (id);


--
-- Name: reliquiasBossProgress reliquiasBossProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasBossProgress"
    ADD CONSTRAINT "reliquiasBossProgress_pkey" PRIMARY KEY (id);


--
-- Name: reliquiasDamage reliquiasDamage_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasDamage"
    ADD CONSTRAINT "reliquiasDamage_pkey" PRIMARY KEY (id);


--
-- Name: reliquiasMemberAssignments reliquiasMemberAssignments_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasMemberAssignments"
    ADD CONSTRAINT "reliquiasMemberAssignments_pkey" PRIMARY KEY (id);


--
-- Name: reliquiasMemberRoles reliquiasMemberRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasMemberRoles"
    ADD CONSTRAINT "reliquiasMemberRoles_pkey" PRIMARY KEY (id);


--
-- Name: reliquiasSeasons reliquiasSeasons_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."reliquiasSeasons"
    ADD CONSTRAINT "reliquiasSeasons_pkey" PRIMARY KEY (id);


--
-- Name: scheduleEntries scheduleEntries_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."scheduleEntries"
    ADD CONSTRAINT "scheduleEntries_pkey" PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: screenshotUploads screenshotUploads_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."screenshotUploads"
    ADD CONSTRAINT "screenshotUploads_pkey" PRIMARY KEY (id);


--
-- Name: strategyAnalysis strategyAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."strategyAnalysis"
    ADD CONSTRAINT "strategyAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: subAdmins subAdmins_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."subAdmins"
    ADD CONSTRAINT "subAdmins_pkey" PRIMARY KEY (id);


--
-- Name: subAdmins subAdmins_username_unique; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."subAdmins"
    ADD CONSTRAINT "subAdmins_username_unique" UNIQUE (username);


--
-- Name: systemBackups systemBackups_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public."systemBackups"
    ADD CONSTRAINT "systemBackups_pkey" PRIMARY KEY (id);


--
-- Name: users users_openId_unique; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_openId_unique" UNIQUE ("openId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sapuri
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict DvL2XCnDk0dCKGtAZxEbQHDrg9f6cCL3GJeWWTaC0F58nDffiDWNEudbjgh6Y5B

