package com.gameeventtracker.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface GameEventDao {
    @Query("SELECT * FROM game_events ORDER BY date ASC, startTime ASC")
    fun getAllEvents(): Flow<List<GameEvent>>

    @Query("SELECT * FROM game_events WHERE game = :game ORDER BY date ASC")
    fun getEventsByGame(game: GameType): Flow<List<GameEvent>>

    @Query("SELECT * FROM game_events WHERE date = :date ORDER BY startTime ASC")
    fun getEventsForDate(date: String): Flow<List<GameEvent>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: GameEvent): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(events: List<GameEvent>)

    @Delete
    suspend fun deleteEvent(event: GameEvent)

    @Query("DELETE FROM game_events WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT COUNT(*) FROM game_events")
    suspend fun getCount(): Int
}
