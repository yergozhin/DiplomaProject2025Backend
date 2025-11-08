import { Request, Response } from 'express';
import { AuthRequest } from '@src/middlewares/auth';
import * as s from './service';

interface ProfileBody {
  firstName?: unknown;
  lastName?: unknown;
  nickname?: unknown;
  phoneNumber?: unknown;
  dateOfBirth?: unknown;
  gender?: unknown;
  currentWeightClass?: unknown;
  height?: unknown;
  reach?: unknown;
  country?: unknown;
  city?: unknown;
  status?: unknown;
  profilePicture?: unknown;
  bio?: unknown;
}

interface RecordBody {
  totalFights?: unknown;
  wins?: unknown;
  losses?: unknown;
  draws?: unknown;
  awards?: unknown;
  recordConfirmed?: unknown;
  recordAdminNotes?: unknown;
}

interface VerificationCreateBody {
  type?: unknown;
  value?: unknown;
  wins?: unknown;
  losses?: unknown;
  draws?: unknown;
  awards?: unknown;
}

interface VerificationReviewBody {
  status?: unknown;
  adminNote?: unknown;
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalString(value: unknown): { valid: boolean; value: string | null } {
  if (value === undefined || value === null) return { valid: true, value: null };
  if (typeof value !== 'string') return { valid: false, value: null };
  const trimmed = value.trim();
  if (trimmed.length === 0) return { valid: true, value: null };
  return { valid: true, value: trimmed };
}

function parseOptionalDate(value: unknown): { valid: boolean; value: string | null } {
  const { valid, value: str } = parseOptionalString(value);
  if (!valid) return { valid: false, value: null };
  if (!str) return { valid: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return { valid: false, value: null };
  return { valid: true, value: str };
}

function parseOptionalInt(value: unknown): { valid: boolean; value: number | null } {
  if (value === undefined || value === null || value === '') return { valid: true, value: null };
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return { valid: false, value: null };
    const int = Math.round(value);
    if (int < 0) return { valid: false, value: null };
    return { valid: true, value: int };
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return { valid: true, value: null };
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return { valid: false, value: null };
    const int = Math.round(num);
    if (int < 0) return { valid: false, value: null };
    return { valid: true, value: int };
  }
  return { valid: false, value: null };
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
  }
  return null;
}

function parseVerificationType(value: unknown): 'link' | 'contact' | 'image' | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'link' || trimmed === 'contact' || trimmed === 'image') return trimmed;
  return null;
}

export async function getAll(_req: Request, res: Response) {
  const r = await s.list();
  res.json(r);
}

export async function getProfile(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.getById(req.user.userId);
  if (!r) return res.status(404).json({ error: 'not_found' });
  res.json(r);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body as ProfileBody;
  const firstName = parseRequiredString(body.firstName);
  const lastName = parseRequiredString(body.lastName);
  const currentWeightClass = parseRequiredString(body.currentWeightClass);
  if (!firstName || !lastName || !currentWeightClass) {
    return res.status(400).json({ error: 'invalid' });
  }

  const nickname = parseOptionalString(body.nickname);
  const phoneNumber = parseOptionalString(body.phoneNumber);
  const { valid: dobValid, value: dateOfBirth } = parseOptionalDate(body.dateOfBirth);
  const gender = parseOptionalString(body.gender);
  const height = parseOptionalInt(body.height);
  const reach = parseOptionalInt(body.reach);
  const country = parseOptionalString(body.country);
  const city = parseOptionalString(body.city);
  const status = parseOptionalString(body.status);
  const profilePicture = parseOptionalString(body.profilePicture);
  const bio = parseOptionalString(body.bio);

  if (!nickname.valid || !phoneNumber.valid || !dobValid || !gender.valid || !height.valid || !reach.valid ||
      !country.valid || !city.valid || !status.valid || !profilePicture.valid || !bio.valid) {
    return res.status(400).json({ error: 'invalid' });
  }

  const r = await s.updateProfile(req.user.userId, {
    firstName,
    lastName,
    nickname: nickname.value,
    phoneNumber: phoneNumber.value,
    dateOfBirth,
    gender: gender.value,
    currentWeightClass,
    height: height.value,
    reach: reach.value,
    country: country.value,
    city: city.value,
    status: status.value,
    profilePicture: profilePicture.value,
    bio: bio.value,
  });
  if (!r) return res.status(404).json({ error: 'not_found' });
  res.json(r);
}

export async function getList(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const r = await s.listExcept(req.user.userId);
  res.json(r);
}

export async function updateRecord(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { fighterId } = req.params;
  if (typeof fighterId !== 'string' || fighterId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }

  const body = req.body as RecordBody;
  const totalFights = parseOptionalInt(body.totalFights);
  const wins = parseOptionalInt(body.wins);
  const losses = parseOptionalInt(body.losses);
  const draws = parseOptionalInt(body.draws);
  const awards = parseOptionalString(body.awards);
  const recordAdminNotes = parseOptionalString(body.recordAdminNotes);

  if (!totalFights.valid || !wins.valid || !losses.valid || !draws.valid || !awards.valid || !recordAdminNotes.valid) {
    return res.status(400).json({ error: 'invalid' });
  }

  const recordConfirmedValue = body.recordConfirmed === undefined ? false : parseBoolean(body.recordConfirmed);
  if (recordConfirmedValue === null) {
    return res.status(400).json({ error: 'invalid' });
  }

  if (totalFights.value !== null) {
    const sum = (wins.value ?? 0) + (losses.value ?? 0) + (draws.value ?? 0);
    if (sum > totalFights.value) {
      return res.status(400).json({ error: 'invalid' });
    }
  }

  const updated = await s.updateRecord(fighterId, req.user.userId, {
    totalFights: totalFights.value,
    wins: wins.value,
    losses: losses.value,
    draws: draws.value,
    awards: awards.value,
    recordConfirmed: recordConfirmedValue,
    recordAdminNotes: recordAdminNotes.value,
  });

  if (!updated) return res.status(404).json({ error: 'not_found' });
  res.json(updated);
}

export async function createVerification(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const body = req.body as VerificationCreateBody;
  const type = parseVerificationType(body.type);
  const value = parseRequiredString(body.value);
  if (!type || !value) return res.status(400).json({ error: 'invalid' });

  const wins = parseOptionalInt(body.wins);
  const losses = parseOptionalInt(body.losses);
  const draws = parseOptionalInt(body.draws);
  const awards = parseOptionalString(body.awards);

  if (!wins.valid || !losses.valid || !draws.valid || !awards.valid) {
    return res.status(400).json({ error: 'invalid' });
  }

  const verification = await s.createVerification(req.user.userId, {
    type,
    value,
    wins: wins.value ?? 0,
    losses: losses.value ?? 0,
    draws: draws.value ?? 0,
    awards: awards.value,
  });
  res.status(201).json(verification);
}

export async function getMyVerifications(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const verifications = await s.listVerifications(req.user.userId);
  res.json(verifications);
}

export async function getPendingVerifications(_req: AuthRequest, res: Response) {
  const verifications = await s.listPendingVerifications();
  res.json(verifications);
}

export async function reviewVerification(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { verificationId } = req.params;
  if (typeof verificationId !== 'string' || verificationId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  const body = req.body as VerificationReviewBody;
  const statusStr = parseRequiredString(body.status);
  if (!statusStr) return res.status(400).json({ error: 'invalid' });
  const status = statusStr.toLowerCase();
  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ error: 'invalid' });
  }
  const adminNote = parseOptionalString(body.adminNote);
  if (!adminNote.valid) return res.status(400).json({ error: 'invalid' });

  const statusTyped: 'accepted' | 'rejected' = status === 'accepted' ? 'accepted' : 'rejected';
  const result = await s.updateVerificationStatus(
    verificationId,
    req.user.userId,
    statusTyped,
    adminNote.value,
  );
  if (!result.verification) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.json(result);
}

export async function getFightersWithPendingVerifications(_req: AuthRequest, res: Response) {
  const fighters = await s.listFightersWithPendingVerifications();
  res.json(fighters);
}

export async function getPendingVerificationDetails(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const { fighterId } = req.params;
  if (typeof fighterId !== 'string' || fighterId.trim().length === 0) {
    return res.status(400).json({ error: 'invalid' });
  }
  const result = await s.getPendingVerificationDetails(fighterId);
  if (!result.fighter) return res.status(404).json({ error: 'not_found' });
  res.json(result);
}


