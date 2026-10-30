package com.gameeventtracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.gameeventtracker.data.AppDatabase
import com.gameeventtracker.data.GameEvent
import com.gameeventtracker.ui.CalendarScreen
import com.gameeventtracker.ui.theme.GameEventTrackerTheme
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val db = AppDatabase.getInstance(applicationContext, lifecycleScope)
        val dao = db.gameEventDao()

        setContent {
            GameEventTrackerTheme(darkTheme = true) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val events by dao.getAllEvents().collectAsState(initial = emptyList())

                    CalendarScreen(
                        events = events,
                        onAddEvent = { newEvent ->
                            lifecycleScope.launch {
                                dao.insertEvent(newEvent)
                            }
                        },
                        onDeleteEvent = { eventId ->
                            lifecycleScope.launch {
                                dao.deleteById(eventId)
                            }
                        }
                    )
                }
            }
        }
    }
}
