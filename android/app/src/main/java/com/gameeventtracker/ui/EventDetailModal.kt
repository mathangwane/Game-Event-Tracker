package com.gameeventtracker.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gameeventtracker.data.GameEvent
import com.gameeventtracker.data.GameType
import com.gameeventtracker.ui.theme.FarmRpgGreen
import com.gameeventtracker.ui.theme.TornCrimson

@Composable
fun EventDetailDialog(
    event: GameEvent,
    onDismissRequest: () -> Unit,
    onDelete: () -> Unit
) {
    val isTorn = event.game == GameType.TORN
    val badgeColor = if (isTorn) TornCrimson else FarmRpgGreen

    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(badgeColor, CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = event.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Game: ${if (isTorn) "Torn" else "Farm RPG"}",
                    fontWeight = FontWeight.SemiBold,
                    color = badgeColor
                )
                Text(text = "Date: ${event.date}", style = MaterialTheme.typography.bodyMedium)

                if (!event.startTime.isNullOrBlank() || !event.endTime.isNullOrBlank()) {
                    Text(
                        text = "Time: ${event.startTime ?: "—"} to ${event.endTime ?: "—"}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                if (!event.description.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Notes:",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.labelMedium
                    )
                    Text(
                        text = event.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.LightGray
                    )
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = onDelete,
                colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
            ) {
                Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Delete")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) {
                Text("Close")
            }
        }
    )
}
