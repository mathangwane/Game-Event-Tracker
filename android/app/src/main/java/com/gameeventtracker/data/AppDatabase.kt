package com.gameeventtracker.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDate

@Database(entities = [GameEvent::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun gameEventDao(): GameEventDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "game_event_tracker.db"
                )
                .addCallback(DatabaseCallback(scope))
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }

    private class DatabaseCallback(
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            INSTANCE?.let { database ->
                scope.launch(Dispatchers.IO) {
                    seedDatabase(database.gameEventDao())
                }
            }
        }

        private suspend fun seedDatabase(dao: GameEventDao) {
            val today = LocalDate.now()
            val sampleEvents = listOf(
                GameEvent(
                    game = GameType.TORN,
                    title = "Elimination Tournament - Round 1",
                    date = today.minusDays(3).toString(),
                    startTime = "12:00",
                    endTime = "18:00",
                    description = "Annual faction elimination brawl. Ensure medical supplies are stocked."
                ),
                GameEvent(
                    game = GameType.TORN,
                    title = "Halloween Trick or Treat Kickoff",
                    date = today.toString(),
                    startTime = "00:00",
                    endTime = "23:59",
                    description = "Citywide basket upgrades and candy trading across all districts."
                ),
                GameEvent(
                    game = GameType.TORN,
                    title = "Dog Tags Bounty Hunt",
                    date = today.plusDays(4).toString(),
                    startTime = "15:00",
                    endTime = "21:00",
                    description = "Hunt rival factions to steal their dog tags for casino exchange rewards."
                ),
                GameEvent(
                    game = GameType.FARM_RPG,
                    title = "Bountiful Harvest Expo",
                    date = today.minusDays(5).toString(),
                    startTime = "06:00",
                    endTime = "20:00",
                    description = "50% boost on crop yields. Gold carrots and giant pumpkins available."
                ),
                GameEvent(
                    game = GameType.FARM_RPG,
                    title = "Community Sprout Festival",
                    date = today.toString(),
                    startTime = "09:00",
                    endTime = "19:00",
                    description = "Collective planting goal to unlock universal stamina refreshments."
                ),
                GameEvent(
                    game = GameType.FARM_RPG,
                    title = "Tower Rush Weekend",
                    date = today.plusDays(2).toString(),
                    startTime = "10:00",
                    endTime = "23:00",
                    description = "Climb the 250-level dungeon tower with 25% reduced silver unlock costs."
                )
            )
            dao.insertAll(sampleEvents)
        }
    }
}
