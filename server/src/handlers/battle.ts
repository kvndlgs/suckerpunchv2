import { Request, Response } from 'express';
import { supabase } from '../supabase';

export const getBattleData = async (req: Request, res: Response) => {
    {
  const { battleId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch battle data with all related information
    const { data: battle, error } = await supabase
      .from('battles')
      .select(`
        *,
        character1:characters!battles_character1_id_fkey(*),
        character2:characters!battles_character2_id_fkey(*),
        winner:characters!battles_winner_id_fkey(*),
        instrumental:instrumentals(*),
        verses:battle_verses(*)
      `)
      .eq('id', battleId)
      .single();

    if (error || !battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    res.json({
      battle,
      shareUrl: `${req.headers.host}/battle/${battleId}`
    });

  } catch (error) {
    console.error('Battle fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch battle' });
  }
 }
}