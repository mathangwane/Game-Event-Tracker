package com.gameeventtracker.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters

enum class GameType {
    TORN,
    FARM_RPG
}

class Converters {
    @TypeConverter
    fun fromGameType(value: GameType): String = value.name

    @TypeConverter
    fun toGameType(value: String): GameType = GameType.valueOf(value)
}

@Entity(tableName = "game_events")
@TypeConverters(Converters::class)
data class GameEvent(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val game: GameType,
    val title: String,
    val date: String, // ISO "YYYY-MM-DD"
    val startTime: String? = null, // "HH:mm"
    val endTime: String? = null,   // "HH:mm"
    val description: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)
