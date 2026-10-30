package com.gameeventtracker.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
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
import com.gameeventtracker.ui.theme.FarmRpgGreen
import com.gameeventtracker.ui.theme.TornCrimson
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(
    events: List<GameEvent>,
    onAddEvent: (GameEvent) -> Unit,
    onDeleteEvent: (Long) -> Unit
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    var showTorn by remember { mutableStateOf(true) }
    var showFarmRpg by remember { mutableStateOf(true) }
    var showEntryDialog by remember { mutableStateOf(false) }
    var selectedEventForDetail by remember { mutableStateOf<GameEvent?>(null) }

    val filteredEvents = remember(events, showTorn, showFarmRpg) {
        events.filter { event ->
            (event.game == GameType.TORN && showTorn) ||
            (event.game == GameType.FARM_RPG && showFarmRpg)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CalendarMonth,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = "Game Event Tracker",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showEntryDialog = true },
                icon = { Icon(Icons.Default.Add, contentDescription = "Add Event") },
                text = { Text("New Event", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.primary
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Month Navigation Controls (Previous, Today, Next)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${currentMonth.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} ${currentMonth.year}",
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

            Spacer(modifier = Modifier.height(8.dp))

            // Game Color-Coding Legend & Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Legend:",
                    style = MaterialTheme.typography.labelMedium,
                    color = Color.Gray
                )

                FilterChip(
                    selected = showTorn,
                    onClick = { showTorn = !showTorn },
                    label = { Text("Torn", fontWeight = FontWeight.Bold) },
                    leadingIcon = {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .background(TornCrimson, CircleShape)
                        )
                    }
                )

                FilterChip(
                    selected = showFarmRpg,
                    onClick = { showFarmRpg = !showFarmRpg },
                    label = { Text("Farm RPG", fontWeight = FontWeight.Bold) },
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

            // Calendar & Events List
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val eventsByDate = filteredEvents.groupBy { it.date }
                val daysInMonth = (1..currentMonth.lengthOfMonth()).map { day ->
                    currentMonth.atDay(day).toString()
                }

                items(daysInMonth) { dateStr ->
                    val dayEvents = eventsByDate[dateStr].orEmpty()
                    val isToday = dateStr == LocalDate.now().toString()

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                if (dayEvents.isNotEmpty()) {
                                    selectedEventForDetail = dayEvents.first()
                                }
                            },
                        colors = CardDefaults.cardColors(
                            containerColor = if (isToday) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = dateStr,
                                    fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isToday) MaterialTheme.colorScheme.primary else Color.White
                                )
                                if (dayEvents.isNotEmpty()) {
                                    Text(
                                        text = "${dayEvents.size} event(s)",
                                        fontSize = 12.sp,
                                        color = Color.Gray
                                    )
                                }
                            }

                            if (dayEvents.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                dayEvents.forEach { ev ->
                                    val badgeColor = if (ev.game == GameType.TORN) TornCrimson else FarmRpgGreen
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 2.dp)
                                            .background(badgeColor.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                                            .border(1.dp, badgeColor.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                                            .padding(horizontal = 8.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(8.dp)
                                                .background(badgeColor, CircleShape)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = ev.title,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            style = MaterialTheme.typography.bodySmall,
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showEntryDialog) {
        EventEntryDialog(
            onDismissRequest = { showEntryDialog = false },
            onSaveEvent = { newEvent ->
                onAddEvent(newEvent)
                showEntryDialog = false
            }
        )
    }

    selectedEventForDetail?.let { event ->
        EventDetailDialog(
            event = event,
            onDismissRequest = { selectedEventForDetail = null },
            onDelete = {
                onDeleteEvent(event.id)
                selectedEventForDetail = null
            }
        )
    }
}
