import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Layers, ShieldCheck, Terminal } from 'lucide-react';

export const ANDROID_FILES: { title: string; filename: string; path: string; language: string; code: string }[] = [
  {
    title: 'Room Entity',
    filename: 'GameEvent.kt',
    path: 'app/src/main/java/com/gameeventtracker/data/GameEvent.kt',
    language: 'kotlin',
    code: `package com.gameeventtracker.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import java.time.LocalDate
import java.time.LocalTime

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
`,
  },
  {
    title: 'Room DAO',
    filename: 'GameEventDao.kt',
    path: 'app/src/main/java/com/gameeventtracker/data/GameEventDao.kt',
    language: 'kotlin',
    code: `package com.gameeventtracker.data

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
`,
  },
  {
    title: 'Room Database & Seeding',
    filename: 'AppDatabase.kt',
    path: 'app/src/main/java/com/gameeventtracker/data/AppDatabase.kt',
    language: 'kotlin',
    code: `package com.gameeventtracker.data

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
`,
  },
  {
    title: 'Jetpack Compose Calendar',
    filename: 'CalendarScreen.kt',
    path: 'app/src/main/java/com/gameeventtracker/ui/CalendarScreen.kt',
    language: 'kotlin',
    code: `package com.gameeventtracker.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gameeventtracker.data.GameEvent
import com.gameeventtracker.data.GameType
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.Locale

val TornRed = Color(0xFFDC2626)
val FarmRpgGreen = Color(0xFF16A34A)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(
    events: List<GameEvent>,
    onAddEventClick: () -> Unit,
    onEventClick: (GameEvent) -> Unit
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    var showTorn by remember { mutableStateOf(true) }
    var showFarmRpg by remember { mutableStateOf(true) }

    val filteredEvents = remember(events, showTorn, showFarmRpg) {
        events.filter { event ->
            (event.game == GameType.TORN && showTorn) ||
            (event.game == GameType.FARM_RPG && showFarmRpg)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Game Event Tracker", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAddEventClick,
                icon = { Icon(Icons.Default.Add, contentDescription = "Add Event") },
                text = { Text("New Event", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.primary
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Month Header Controls: Previous, Today, Next
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "\${currentMonth.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} \${currentMonth.year}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { currentMonth = currentMonth.minusMonths(1) }) {
                        Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month")
                    }
                    TextButton(onClick = { currentMonth = YearMonth.now() }) {
                        Text("Today", fontWeight = FontWeight.Bold)
                    }
                    IconButton(onClick = { currentMonth = currentMonth.plusMonths(1) }) {
                        Icon(Icons.Default.ChevronRight, contentDescription = "Next Month")
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Color-Coded Game Legend & Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                FilterChip(
                    selected = showTorn,
                    onClick = { showTorn = !showTorn },
                    label = { Text("Torn", fontWeight = FontWeight.SemiBold) },
                    leadingIcon = {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .background(TornRed, CircleShape)
                        )
                    }
                )

                FilterChip(
                    selected = showFarmRpg,
                    onClick = { showFarmRpg = !showFarmRpg },
                    label = { Text("Farm RPG", fontWeight = FontWeight.SemiBold) },
                    leadingIcon = {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .background(FarmRpgGreen, CircleShape)
                        )
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Calendar Month Grid View with Day Cells & Compact Badges
            // (Days rendered with +N more indicators and color coding)
            CalendarGrid(
                currentMonth = currentMonth,
                events = filteredEvents,
                onEventClick = onEventClick
            )
        }
    }
}
`,
  },
  {
    title: 'Event Entry Screen',
    filename: 'EventEntryDialog.kt',
    path: 'app/src/main/java/com/gameeventtracker/ui/EventEntryDialog.kt',
    language: 'kotlin',
    code: `package com.gameeventtracker.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gameeventtracker.data.GameEvent
import com.gameeventtracker.data.GameType
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventEntryDialog(
    onDismissRequest: () -> Unit,
    onSaveEvent: (GameEvent) -> Unit
) {
    var selectedGame by remember { mutableStateOf<GameType?>(null) }
    var title by remember { mutableStateOf("") }
    var selectedDate by remember { mutableStateOf(LocalDate.now().toString()) }
    var startTime by remember { mutableStateOf("") }
    var endTime by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    var gameError by remember { mutableStateOf<String?>(null) }
    var titleError by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text("Add Game Event", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Game Selector (Segmented Button Group)
                Text("Select Game *", style = MaterialTheme.typography.labelMedium)
                SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                    SegmentedButton(
                        selected = selectedGame == GameType.TORN,
                        onClick = {
                            selectedGame = GameType.TORN
                            gameError = null
                        },
                        shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2)
                    ) {
                        Text("Torn")
                    }
                    SegmentedButton(
                        selected = selectedGame == GameType.FARM_RPG,
                        onClick = {
                            selectedGame = GameType.FARM_RPG
                            gameError = null
                        },
                        shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2)
                    ) {
                        Text("Farm RPG")
                    }
                }
                gameError?.let {
                    Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }

                // Event Title TextField
                OutlinedTextField(
                    value = title,
                    onValueChange = {
                        title = it
                        titleError = null
                    },
                    label = { Text("Event Title *") },
                    isError = titleError != null,
                    supportingText = titleError?.let { { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                // Date Picker Trigger (Material 3 DatePicker)
                OutlinedTextField(
                    value = selectedDate,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Event Date *") },
                    modifier = Modifier.fillMaxWidth()
                )

                // Optional Start & End Time Pickers
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = startTime,
                        onValueChange = { startTime = it },
                        label = { Text("Start (optional)") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = endTime,
                        onValueChange = { endTime = it },
                        label = { Text("End (optional)") },
                        modifier = Modifier.weight(1f)
                    )
                }

                // Notes / Description
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description / Notes") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    var hasError = false
                    if (selectedGame == null) {
                        gameError = "Please choose Torn or Farm RPG"
                        hasError = true
                    }
                    if (title.isBlank()) {
                        titleError = "Title is required"
                        hasError = true
                    }
                    if (!hasError) {
                        onSaveEvent(
                            GameEvent(
                                game = selectedGame!!,
                                title = title.trim(),
                                date = selectedDate,
                                startTime = startTime.ifBlank { null },
                                endTime = endTime.ifBlank { null },
                                description = description.ifBlank { null }
                            )
                        )
                        onDismissRequest()
                    }
                }
            ) {
                Text("Save Event")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) {
                Text("Cancel")
            }
        }
    )
}
`,
  },
  {
    title: 'Gradle Build & Signing',
    filename: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp)
}

android {
    namespace = "com.gameeventtracker"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.gameeventtracker"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        create("release") {
            // Configured for direct USB ADB deployment and release signing
            storeFile = file("release.keystore")
            storePassword = System.getenv("KEYSTORE_PASSWORD") ?: "android"
            keyAlias = System.getenv("KEY_ALIAS") ?: "androiddebugkey"
            keyPassword = System.getenv("KEY_PASSWORD") ?: "android"
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
        getByName("debug") {
            enableV1Signing = true
            enableV2Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Jetpack Compose BOM & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Room Persistence
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // AndroidX Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
}
`,
  },
  {
    title: 'AndroidManifest',
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.GameEventTracker">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.GameEventTracker">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
];

export const AndroidCodeInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = ANDROID_FILES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[24px] bg-[#13151B] border border-[#232732] shadow-xl overflow-hidden flex flex-col">
      {/* Code Inspector Header */}
      <div className="px-5 py-3.5 bg-[#181B22] border-b border-[#252A36] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Native Android Project Source</h3>
            <p className="text-[11px] text-slate-400 font-mono">{activeFile.path}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232733] hover:bg-[#2E3444] text-xs font-semibold text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Source'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-[#15171E] border-b border-[#232732] overflow-x-auto">
        {ANDROID_FILES.map((file, idx) => (
          <button
            key={file.filename}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === idx
                ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* Code Body */}
      <div className="p-4 bg-[#0E1015] overflow-x-auto max-h-[500px]">
        <pre className="font-mono text-xs text-slate-300 leading-relaxed">
          <code>{activeFile.code}</code>
        </pre>
      </div>
    </div>
  );
};
